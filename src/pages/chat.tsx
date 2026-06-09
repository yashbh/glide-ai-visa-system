import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Composer } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { DocPanel } from "../components/chat/doc-panel";
import { Topbar } from "../components/layout/topbar";
import { useChat } from "../hooks/use-chat";
import { useDocuments } from "../hooks/use-documents";
import { useAuth } from "../hooks/use-auth";

const DOC_START = "---DOCUMENT_START---";
const DOC_END = "---DOCUMENT_END---";
const TITLE_PREFIX = "TITLE:";

function extractDocument(content: string): { title: string; body: string } | null {
  const startIdx = content.indexOf(DOC_START);
  const endIdx = content.indexOf(DOC_END);
  if (startIdx === -1 || endIdx === -1) return null;

  const docContent = content.slice(startIdx + DOC_START.length, endIdx).trim();
  const lines = docContent.split("\n");

  let title = "Generated Document";
  let bodyStart = 0;

  if (lines[0]?.startsWith(TITLE_PREFIX)) {
    title = lines[0].slice(TITLE_PREFIX.length).trim();
    bodyStart = 1;
  }

  const body = lines.slice(bodyStart).join("\n").trim();
  return { title, body };
}

function getMessageWithoutDoc(content: string): string {
  const startIdx = content.indexOf(DOC_START);
  if (startIdx === -1) return content;
  return content.slice(0, startIdx).trim();
}

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
  const [docPanel, setDocPanel] = useState<{ title: string; body: string } | null>(null);
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

  // Detect document in the latest message (works during streaming too)
  const isDocGenerating = useMemo(() => {
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant") return false;
    return lastMsg.content.includes(DOC_START) && !lastMsg.content.includes(DOC_END);
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    // Open panel as soon as we detect document start (even before it's complete)
    if (lastMsg.content.includes(DOC_START) && !docPanel) {
      const titleMatch = lastMsg.content.match(/---DOCUMENT_START---\s*\n?TITLE:\s*(.+)/);
      setDocPanel({ title: titleMatch?.[1]?.trim() || "Generating...", body: "" });
    }

    const doc = extractDocument(lastMsg.content);
    if (doc) {
      setDocPanel(doc);
    }
  }, [messages]);

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

  const handleDocApprove = useCallback(async (editedContent: string) => {
    if (!docPanel || !user) return;
    const blob = new Blob([editedContent], { type: "text/plain" });
    const file = new File([blob], `${docPanel.title.toLowerCase().replace(/\s+/g, "-")}.txt`, { type: "text/plain" });

    const timestamp = Date.now();
    const storagePath = `${user.id}/${country}/${timestamp}_${file.name}`;

    const { error: uploadError } = await (await import("../lib/supabase")).supabase.storage
      .from("documents")
      .upload(storagePath, file, { contentType: "text/plain", upsert: false });

    if (!uploadError) {
      await (await import("../lib/supabase")).supabase.from("documents").insert({
        user_id: user.id,
        conversation_id: conversationId,
        country,
        title: docPanel.title,
        file_name: file.name,
        file_type: "text/plain",
        file_size: blob.size,
        storage_path: storagePath,
        status: "verified",
      });
    }

    setDocPanel(null);
    sendMessage(`I've approved the "${docPanel.title}" document.`);
  }, [docPanel, user, country, conversationId, sendMessage]);

  // Strip document markers from displayed messages
  const displayMessages = useMemo(() =>
    messages.map((msg) => {
      if (msg.role === "assistant" && msg.content.includes(DOC_START)) {
        return { ...msg, content: getMessageWithoutDoc(msg.content) };
      }
      return msg;
    }),
  [messages]);

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
      <div className="flex-1 flex min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="max-w-[760px] mx-auto px-6 py-7 flex flex-col gap-[22px]">
              {displayMessages.map((msg) => (
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

        {/* Document panel */}
        {docPanel && (
          <DocPanel
            title={docPanel.title}
            content={docPanel.body}
            isGenerating={isDocGenerating}
            isOpen={true}
            onClose={() => setDocPanel(null)}
            onApprove={handleDocApprove}
          />
        )}
      </div>
    </>
  );
}
