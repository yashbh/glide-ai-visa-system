import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversation_id, message } = await req.json();

    if (!conversation_id || !message) {
      return new Response(JSON.stringify({ error: "Missing conversation_id or message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message too long (max 2000 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if conversation exists; if not, create it
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .single();

    let country = "germany";
    let visaType = "schengen_tourist";

    if (conversation) {
      country = conversation.country || "germany";
      visaType = conversation.visa_type || "schengen_tourist";
    } else {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("france")) {
        country = "france";
      } else if (lowerMessage.includes("germany")) {
        country = "germany";
      }

      await supabase.from("conversations").insert({
        id: conversation_id,
        user_id: user.id,
        title: `Travel to ${country.charAt(0).toUpperCase() + country.slice(1)}`,
        country,
        visa_type: visaType,
        status: "active",
      });
    }

    // Store user message
    await supabase.from("messages").insert({
      conversation_id,
      role: "user",
      content: message,
    });

    // Fetch requirements for this country
    const { data: requirements } = await supabase
      .from("visa_requirements")
      .select("*")
      .eq("country", country)
      .eq("visa_type", visaType)
      .order("display_order");

    // Fetch conversation history (last 20 messages)
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Build system prompt
    const requirementsList = (requirements || [])
      .map((r: any) => `- [${r.category}] ${r.title}: ${r.description}\n  Threshold: ${r.threshold || "N/A"}\n  If not met: ${r.recommendation}\n  Suggested question: ${r.question_hint || "N/A"}`)
      .join("\n\n");

    const systemPrompt = `You are Glide, a friendly and knowledgeable AI visa assistant. You help users prepare their visa applications.

CONTEXT:
The user wants to visit ${country.charAt(0).toUpperCase() + country.slice(1)} on a ${visaType.replace("_", " ")} visa.

REQUIREMENTS FOR THIS VISA (your internal checklist — do NOT reveal all at once):
${requirementsList}

CRITICAL PACING RULES:
- Ask about ONLY 1-2 requirements per message. Never list all requirements at once.
- Wait for the user to respond before moving to the next requirement.
- Start with a brief welcome (1-2 sentences), then ask your FIRST question only.
- After the user answers, give brief feedback on their answer, then ask the NEXT question.
- Think of this as a friendly interview — one topic at a time, back and forth.
- Keep your responses SHORT: 3-5 sentences max per message. No walls of text.

CONVERSATION FLOW:
1. First message: Brief welcome + ask about bank balance (financial first)
2. User answers → give feedback → ask about income proof
3. User answers → give feedback → ask about passport validity
4. Continue one by one through the checklist...
5. After all are covered: give a final summary of what's ready vs needs attention

RESPONSE STYLE:
- Be concise and warm. Short paragraphs, not essays.
- If they meet a requirement: "Great, that's sorted! ✓" then move on.
- If they don't meet it: brief explanation of what's needed + one actionable tip. Don't overwhelm.
- Use markdown for emphasis but keep formatting minimal.
- Never dump the full checklist. Never list more than 2 items at once.

BOUNDARIES:
- Stay on topic: only travel/visa matters.
- If asked something unrelated: "I'm focused on visa applications — let me help you with that instead."
- Never fabricate requirements not in the list above.
- Never give legal advice.`;

    // Build messages array for OpenAI
    const openaiMessages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role as string, content: m.content })),
    ];

    // Call OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return new Response(JSON.stringify({ error: `OpenAI error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = await openaiResponse.json();
    const reply = openaiData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Store assistant response
    await supabase.from("messages").insert({
      conversation_id,
      role: "assistant",
      content: reply,
    });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
