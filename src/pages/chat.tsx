import { useState, useRef, useEffect, useCallback } from "react";
import { Composer } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { Topbar } from "../components/layout/topbar";
import { useChat } from "../hooks/use-chat";
import { useDocuments } from "../hooks/use-documents";
import { useAuth } from "../hooks/use-auth";

interface ChatPageProps {
  conversationId: string;
  country: string;
  title: string;
  isNew: boolean;
  onConversationCreated: () => void;
  onDelete: () => void;
}

export function ChatPage({ conversationId, country, title, isNew, onConversationCreated, onDelete }: ChatPageProps) {
  const { user } = useAuth();
  const { messages, isLoading, historyLoaded, sendMessage } = useChat(conversationId);
  const { uploadDocument, isUploading } = useDocuments(user?.id || "", country);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!historyLoaded || hasSentInitial.current) return;
    if (isNew && messages.length === 0) {
      hasSentInitial.current = true;
      sendMessage(`I want to travel to ${country}. Can you help me with the visa process?`).then(() => {
        onConversationCreated();
      });
    }
  }, [historyLoaded, isNew, messages.length, country, sendMessage, onConversationCreated]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    sendMessage(trimmed);
  }, [input, sendMessage]);

  const handleFileAttach = useCallback(async (file: File) => {
    const { document: doc, error } = await uploadDocument(file, conversationId);
    if (error) {
      sendMessage(`[Upload failed: ${error}]`);
      return;
    }
    if (doc) {
      const sizeKB = (doc.file_size / 1024).toFixed(0);
      sendMessage(`I've uploaded my document: ${doc.title} (${doc.file_type}, ${sizeKB}KB)`);
    }
  }, [uploadDocument, conversationId, sendMessage]);

  if (!historyLoaded) {
    return (
      <div className="flex-1 grid place-items-center">
        <div className="text-slate-400 text-sm">Loading conversation...</div>
      </div>
    );
  }

  return (
    <>
      <Topbar title={title} messages={messages} onDelete={onDelete} />
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-[760px] mx-auto px-6 py-7 flex flex-col gap-[22px]">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {(isLoading || isUploading) && <TypingIndicator />}
          </div>
        </div>
        <Composer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onFileAttach={handleFileAttach}
          placeholder="Reply to Glide..."
          disabled={isLoading || isUploading}
        />
      </div>
    </>
  );
}
