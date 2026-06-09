import { useState, useCallback } from "react";
import { sendChatMessage } from "../lib/api";
import type { Message } from "../types";

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return { messages, isLoading, sendMessage };
}
