import { supabase } from "./supabase";

interface ChatRequest {
  conversation_id: string;
  message: string;
}

interface ChatResponse {
  reply: string;
  error?: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: `Welcome! I'd be happy to help you with your visa application. 🇩🇪

Let's start with your **finances**. For a Germany Schengen tourist visa, you need a minimum bank balance of ₹5,00,000 maintained for the last 3 months.

How much balance do you currently have in your bank account?`,
  low_balance: `I see — ₹2,00,000 is below the recommended ₹5,00,000.

Here's what you can do:
• Show additional assets (FDs, mutual funds, PPF)
• Get a family sponsor with sufficient funds
• Build up over time if your trip is a few months away

Would you like to explore these options? Next — are you currently employed?`,
  employed: `Great — being employed strengthens your application.

You'll need from your employer:
• Employment letter on company letterhead
• Leave approval matching your travel dates

Can your HR provide these? Next — when does your passport expire?`,
  passport: `Good. For a Schengen visa you need at least 3 months validity beyond return + 2 blank pages.

Now about travel — have you booked flights yet?`,
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("2 lakh") || lower.includes("200000") || lower.includes("2,00") || lower.includes("two lakh")) {
    return MOCK_RESPONSES.low_balance;
  }
  if (lower.includes("employed") || lower.includes("job") || lower.includes("work") || lower.includes("salaried") || lower.includes("company")) {
    return MOCK_RESPONSES.employed;
  }
  if (lower.includes("passport") || lower.includes("expire") || lower.includes("valid") || lower.includes("2032") || lower.includes("2030")) {
    return MOCK_RESPONSES.passport;
  }
  return MOCK_RESPONSES.default;
}

export async function sendChatMessage(
  request: ChatRequest,
  onChunk?: (content: string) => void
): Promise<ChatResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Mock mode
  if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
    const mockReply = getMockResponse(request.message);
    if (onChunk) {
      const words = mockReply.split(" ");
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 30));
        onChunk(words[i] + (i < words.length - 1 ? " " : ""));
      }
    }
    return { reply: mockReply };
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { reply: "", error: "Not authenticated" };
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { reply: "", error: errorText || "Chat request failed" };
  }

  // Handle streaming response
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullReply = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullReply += parsed.content;
            if (onChunk) onChunk(parsed.content);
          }
          if (parsed.error) {
            return { reply: "", error: parsed.error };
          }
        } catch {
          // incomplete JSON — will not happen now since we buffer lines properly
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith("data: ")) {
      const data = buffer.trim().slice(6);
      if (data !== "[DONE]") {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullReply += parsed.content;
            if (onChunk) onChunk(parsed.content);
          }
        } catch {
          // ignore final incomplete chunk
        }
      }
    }

    return { reply: fullReply };
  }

  // Fallback for non-streaming response
  const data = await response.json();
  return { reply: data.reply, error: undefined };
}

interface GenerateDocRequest {
  doc_type: "cover_letter" | "itinerary";
  country: string;
  context: string;
}

interface GenerateDocResponse {
  title: string;
  document: string;
  error?: string;
}

export async function generateDocument(request: GenerateDocRequest): Promise<GenerateDocResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Mock mode
  if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
    await new Promise((r) => setTimeout(r, 2000));
    return {
      title: `${request.country.charAt(0).toUpperCase() + request.country.slice(1)} Cover Letter`,
      document: `[Your Address]\n[City, State]\n\nDate: ${new Date().toLocaleDateString()}\n\nThe Visa Officer\nGerman Consulate General\n\nSubject: Application for Schengen Tourist Visa\n\nDear Sir/Madam,\n\nI am writing to apply for a Schengen tourist visa to visit Germany.\n\n[Mock document content - connect Supabase for real generation]\n\nYours sincerely,\n[Your Name]`,
    };
  }

  const { supabase } = await import("./supabase");
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { title: "", document: "", error: "Not authenticated" };
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-doc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { title: "", document: "", error: errorText || "Document generation failed" };
  }

  const data = await response.json();
  return { title: data.title, document: data.document, error: undefined };
}
