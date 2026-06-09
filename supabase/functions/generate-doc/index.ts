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

    const { doc_type, country, context } = await req.json();

    if (!doc_type || !country || !context) {
      return new Response(JSON.stringify({ error: "Missing doc_type, country, or context" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);

    const prompts: Record<string, string> = {
      cover_letter: `Write a formal cover letter for a Schengen Tourist Visa application to ${countryCapitalized}.

Use this information from the applicant:
${context}

FORMAT REQUIREMENTS:
- Write the COMPLETE letter, ready to print and submit
- Use formal business letter format
- Include: sender address, date, consulate address, subject line, salutation, body, closing, signature
- Do NOT use any markdown formatting (no **, no ##, no bullet points with *)
- Use plain text only with proper line breaks between paragraphs
- Fill in every detail from the context provided. If something is unknown, use a reasonable professional default
- The letter must be error-free, professional, and convincing
- Mention: purpose of visit, exact travel dates, cities to visit, accommodation plans, financial capability, employment status, and intent to return home
- End with "Yours sincerely," and the applicant's name`,

      itinerary: `Write a detailed day-by-day travel itinerary for a trip to ${countryCapitalized}.

Use this information:
${context}

FORMAT REQUIREMENTS:
- Day-by-day format: "Day 1 (Date): City"
- Under each day list activities, transport, and accommodation
- Do NOT use markdown formatting (no **, no ##)
- Use plain text with clear line breaks
- Be specific about attractions, restaurants, and logistics
- Include check-in/check-out times for hotels
- The itinerary must be realistic and complete`,
    };

    const systemPrompt = prompts[doc_type] || prompts.cover_letter;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional document writer. Output ONLY the document content — no preamble, no explanations, no markdown. Just the clean formatted text." },
          { role: "user", content: systemPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
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
    const document = openaiData.choices[0]?.message?.content || "";

    const title = doc_type === "cover_letter"
      ? `${countryCapitalized} Cover Letter`
      : `${countryCapitalized} Travel Itinerary`;

    return new Response(JSON.stringify({ title, document }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
