import { useState, useCallback, useEffect, useRef } from "react";
import { sendChatMessage } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { Message } from "../types";

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const streamingIdRef = useRef<string | null>(null);

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

    const assistantId = crypto.randomUUID();
    streamingIdRef.current = assistantId;

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add empty assistant message that will be streamed into
    const assistantMessage: Message = {
      id: assistantId,
      conversation_id: conversationId,
      role: "assistant",
      content: "",
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    const response = await sendChatMessage(
      { conversation_id: conversationId, message: content },
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    );

    streamingIdRef.current = null;
    setIsLoading(false);

    if (response.error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Sorry, I encountered an error: ${response.error}` }
            : m
        )
      );
      return;
    }

    // Final update with complete content (in case streaming missed anything)
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, content: response.reply } : m
      )
    );
  }, [conversationId]);

  return { messages, isLoading, historyLoaded, sendMessage };
}
