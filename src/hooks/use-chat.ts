import { useState, useCallback, useEffect, useRef } from "react";
import { sendChatMessage } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { Message } from "../types";

const COVER_LETTER_START = "---COVER_LETTER_START---";
const COVER_LETTER_END = "---COVER_LETTER_END---";

export interface CoverLetterEvent {
  title: string;
  content: string;
  isGenerating: boolean;
}

export function useChat(conversationId: string, onCoverLetter?: (event: CoverLetterEvent) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const streamingIdRef = useRef<string | null>(null);
  const coverLetterBufferRef = useRef<string>("");
  const inCoverLetterRef = useRef(false);

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

  const sendMessage = useCallback(async (content: string, imageBase64?: string, imageType?: string) => {
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

    coverLetterBufferRef.current = "";
    inCoverLetterRef.current = false;

    const response = await sendChatMessage(
      { conversation_id: conversationId, message: content, image_base64: imageBase64, image_type: imageType },
      (chunk) => {
        if (!inCoverLetterRef.current) {
          setMessages((prev) => {
            const msg = prev.find((m) => m.id === assistantId);
            const combined = (msg?.content || "") + chunk;

            // Show skeleton DocPanel early when LLM mentions generating cover letter
            if (!coverLetterBufferRef.current && onCoverLetter && combined.toLowerCase().includes("cover letter") && (combined.toLowerCase().includes("here") || combined.toLowerCase().includes("generat") || combined.toLowerCase().includes("prepared"))) {
              onCoverLetter({ title: "Cover Letter", content: "", isGenerating: true });
            }

            if (combined.includes(COVER_LETTER_START)) {
              inCoverLetterRef.current = true;
              const parts = combined.split(COVER_LETTER_START);
              const beforeMarker = parts[0];
              coverLetterBufferRef.current = parts[1] || "";
              if (onCoverLetter) {
                onCoverLetter({ title: "Cover Letter", content: coverLetterBufferRef.current, isGenerating: true });
              }
              return prev.map((m) =>
                m.id === assistantId ? { ...m, content: beforeMarker } : m
              );
            }
            return prev.map((m) =>
              m.id === assistantId ? { ...m, content: combined } : m
            );
          });
        } else {
          // We're inside the cover letter — buffer content for the doc panel
          coverLetterBufferRef.current += chunk;
          let coverContent = coverLetterBufferRef.current;
          let ended = false;
          if (coverContent.includes(COVER_LETTER_END)) {
            coverContent = coverContent.split(COVER_LETTER_END)[0];
            coverLetterBufferRef.current = coverContent;
            inCoverLetterRef.current = false;
            ended = true;
          }
          if (onCoverLetter) {
            onCoverLetter({ title: "Cover Letter", content: coverContent, isGenerating: !ended });
          }
        }
      },
      (meta) => {
        console.log(`[Glide] Using ${meta.provider} (${meta.model})`);
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

    // Final update — strip cover letter markers from displayed message
    let finalContent = response.reply;
    if (finalContent.includes(COVER_LETTER_START)) {
      finalContent = finalContent.split(COVER_LETTER_START)[0];
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, content: finalContent } : m
      )
    );
  }, [conversationId, onCoverLetter]);

  return { messages, isLoading, historyLoaded, sendMessage };
}
