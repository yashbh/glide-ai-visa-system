import { supabase } from "./supabase";

interface ChatRequest {
  conversation_id: string;
  message: string;
}

interface ChatResponse {
  reply: string;
  error?: string;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { reply: "", error: "Not authenticated" };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
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

  const data = await response.json();
  return { reply: data.reply, error: undefined };
}
