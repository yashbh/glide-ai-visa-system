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

    const systemPrompt = `You are Glide, a friendly and knowledgeable AI visa assistant. You help users prepare their visa applications by walking them through requirements.

CONTEXT:
The user wants to visit ${country.charAt(0).toUpperCase() + country.slice(1)} on a ${visaType.replace("_", " ")} visa.

REQUIREMENTS FOR THIS VISA:
${requirementsList}

INSTRUCTIONS:
- Walk the user through these requirements in a natural, conversational way.
- Group related topics when it makes sense (e.g., ask about finances together, documents together).
- For each requirement, ask the user about their situation.
- If they meet a requirement, acknowledge it positively and move to the next topic.
- If they DON'T meet a requirement, explain what's recommended and give actionable advice. Be encouraging, not discouraging — frame it as "here's what you can do."
- Keep track of which requirements have been discussed. Once all are covered, provide a clear summary of what's ready vs. what needs attention.
- Stay strictly on topic: only discuss travel and visa-related matters.
- If the user asks something unrelated to travel/visas, politely redirect: "I'm specialized in visa applications — let me help you with that instead."
- Be concise but warm. Use bullet points for lists. Use simple language.
- When offering to help with documents (cover letter, itinerary), mention that you can help draft them.
- Never fabricate requirements that aren't in the list above.
- Never give legal advice — you provide guidance based on general requirements.`;

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
