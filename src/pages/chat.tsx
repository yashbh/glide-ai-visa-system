import { useState, useRef, useEffect } from "react";
import { Composer } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { useChat } from "../hooks/use-chat";

interface ChatPageProps {
  conversationId: string;
  country: string;
  isNew: boolean;
  onConversationCreated: () => void;
}

export function ChatPage({ conversationId, country, isNew, onConversationCreated }: ChatPageProps) {
  const { messages, isLoading, historyLoaded, sendMessage } = useChat(conversationId);
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

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    sendMessage(trimmed);
  }

  if (!historyLoaded) {
    return (
      <div className="flex-1 grid place-items-center">
        <div className="text-slate-400 text-sm">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-[760px] mx-auto px-6 py-7 flex flex-col gap-[22px]">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </div>
      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder="Reply to Glide..."
        disabled={isLoading}
      />
    </div>
  );
}
