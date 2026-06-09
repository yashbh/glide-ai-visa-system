import { useState, useCallback, useEffect } from "react";
import { sendChatMessage } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { Message } from "../types";

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setMessages(data as Message[]);
      }
      setHistoryLoaded(true);
    }

    setMessages([]);
    setHistoryLoaded(false);
    loadHistory();
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: "user",
      content,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const response = await sendChatMessage({
      conversation_id: conversationId,
      message: content,
    });

    setIsLoading(false);

    if (response.error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: "assistant",
        content: `Sorry, I encountered an error: ${response.error}. Please check that your Supabase and OpenAI credentials are configured.`,
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: "assistant",
      content: response.reply,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, [conversationId]);

  return { messages, isLoading, historyLoaded, sendMessage };
}
