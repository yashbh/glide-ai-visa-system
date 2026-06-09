import { useState, useRef, useEffect } from "react";
import { Composer } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { useChat } from "../hooks/use-chat";

interface ChatPageProps {
  country: string;
}

export function ChatPage({ country }: ChatPageProps) {
  const conversationId = useRef(crypto.randomUUID()).current;
  const { messages, isLoading, sendMessage } = useChat(conversationId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, isLoading]);

  const hasSentInitial = useRef(false);
  useEffect(() => {
    if (hasSentInitial.current) return;
    hasSentInitial.current = true;
    sendMessage(`I want to travel to ${country}. Can you help me with the visa process?`);
  }, []);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    sendMessage(trimmed);
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
