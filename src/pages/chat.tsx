import { useState, useRef, useEffect, useCallback } from "react";
import { Composer } from "../components/chat/composer";
import type { AttachmentMeta } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { DocPanel } from "../components/chat/doc-panel";
import { Topbar } from "../components/layout/topbar";
import { useChat } from "../hooks/use-chat";
import { useDocuments } from "../hooks/use-documents";
import { useAuth } from "../hooks/use-auth";

function fileToBase64Raw(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImageToBase64(file: File, maxSize = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      resolve(dataUrl.split(",")[1]);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Extract traveler names from conversation (looks for user messages with names)
function extractTravelerNames(messages: { role: string; content: string }[]): string[] {
  const names: string[] = [];
  for (const msg of messages) {
    if (msg.role === "user") {
      const selfMatch = msg.content.match(/(?:my name is|I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (selfMatch?.[1] && !names.includes(selfMatch[1])) names.push(selfMatch[1]);
      const withMatch = msg.content.match(/(?:with|wife|husband|spouse|child|son|daughter)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g);
      if (withMatch) {
        for (const m of withMatch) {
          const name = m.replace(/^(?:with|wife|husband|spouse|child|son|daughter)\s+/i, "").trim();
          if (name.length > 1 && name.length < 30 && !names.includes(name)) names.push(name);
        }
      }
    }
  }
  return names;
}

interface ChatPageProps {
  conversationId: string;
  country: string;
  title: string;
  isNew: boolean;
  existingTravelers: { name: string; relationship: string }[];
  onConversationCreated: () => void;
  onTravelersAdded: (travelers: { name: string; relationship: string }[]) => Promise<void>;
  onDelete: () => void;
  onMenuToggle?: () => void;
}

export function ChatPage({ conversationId, country, title, isNew, existingTravelers, onConversationCreated, onDelete, onMenuToggle }: ChatPageProps) {
  const { user } = useAuth();
  const { uploadDocument, isUploading } = useDocuments(user?.id || "", country);
  const [input, setInput] = useState("");
  const [docPanel, setDocPanel] = useState<{ title: string; body: string } | null>(null);
  const [isDocGenerating, setIsDocGenerating] = useState(false);
  const [travelers, setTravelers] = useState<string[]>(existingTravelers.map((t) => t.name));
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  const handleCoverLetter = useCallback((event: { title: string; content: string; isGenerating: boolean }) => {
    setDocPanel({ title: event.title, body: event.content });
    setIsDocGenerating(event.isGenerating);
  }, []);

  const { messages, isLoading, historyLoaded, sendMessage } = useChat(conversationId, handleCoverLetter);

  // Keep travelers in sync with parent
  useEffect(() => {
    if (existingTravelers.length > 0) {
      setTravelers(existingTravelers.map((t) => t.name));
    }
  }, [existingTravelers]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, isLoading]);

  // Send initial greeting for new conversations
  useEffect(() => {
    if (!historyLoaded || hasSentInitial.current) return;
    if (isNew && messages.length === 0) {
      hasSentInitial.current = true;
      sendMessage(`Hi! I'm interested in traveling to ${country}.`).then(() => {
        onConversationCreated();
      });
    } else if (!isNew && existingTravelers.length === 0) {
      const names = extractTravelerNames(messages);
      if (names.length > 0) setTravelers(names);
    }
  }, [historyLoaded, isNew, messages.length, existingTravelers]);

  const handleSend = useCallback(async (attachment?: AttachmentMeta) => {
    const trimmed = input.trim();
    const hasContent = trimmed.length > 0 || attachment;
    if (!hasContent) return;
    setInput("");

    // If there's an attachment with explicit doc type + traveler from dropdowns
    if (attachment) {
      const { file, docType, travelerName } = attachment;

      const { document: doc, error } = await uploadDocument(file, conversationId, {
        travelerName,
        docType,
      });

      if (error) {
        sendMessage(`[Upload failed: ${error}]`);
        return;
      }
      if (doc) {
        const sizeKB = (doc.file_size / 1024).toFixed(0);
        const fileMsg = trimmed
          ? `${trimmed}\n\n[Attached: ${docType} (${travelerName}'s) — ${doc.file_type}, ${sizeKB}KB]`
          : `[Attached: ${docType} (${travelerName}'s) — ${doc.file_type}, ${sizeKB}KB]`;

        console.log(`[Glide] File type: "${file.type}", name: "${file.name}", size: ${file.size}`);

        const isImage = file.type.startsWith("image/") || file.name.match(/\.(jpg|jpeg|png)$/i);
        const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

        if (isImage) {
          try {
            const base64 = await compressImageToBase64(file);
            console.log(`[Glide] Image compressed: ${(base64.length / 1024).toFixed(0)}KB base64`);
            sendMessage(fileMsg, base64, "image/jpeg");
          } catch (err) {
            console.error("[Glide] Image compression failed:", err);
            sendMessage(fileMsg);
          }
        } else if (isPdf) {
          // Send PDF as base64 for OCR extraction
          const base64 = await fileToBase64Raw(file);
          console.log(`[Glide] PDF base64: ${(base64.length / 1024).toFixed(0)}KB`);
          sendMessage(fileMsg, base64, "application/pdf");
        } else {
          sendMessage(fileMsg);
        }
      }
      return;
    }

    // Normal message
    sendMessage(trimmed);
  }, [input, sendMessage, uploadDocument, conversationId]);

  const handleDocApprove = useCallback(async (editedContent: string) => {
    if (!docPanel || !user) return;
    const blob = new Blob([editedContent], { type: "text/plain" });
    const file = new File([blob], `${docPanel.title.toLowerCase().replace(/\s+/g, "-")}.txt`, { type: "text/plain" });

    const timestamp = Date.now();
    const storagePath = `${user.id}/${country}/${timestamp}_${file.name}`;

    const { supabase } = await import("../lib/supabase");

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, { contentType: "text/plain", upsert: false });

    if (!uploadError) {
      await supabase.from("documents").insert({
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
    sendMessage(`I've approved the "${docPanel.title}" document. ✓`);
  }, [docPanel, user, country, conversationId, sendMessage]);

  if (!historyLoaded) {
    return (
      <div className="flex-1 grid place-items-center">
        <div className="text-slate-400 text-sm">Loading conversation...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          {/* Transparent sticky header */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <Topbar title={title} messages={messages} onDelete={onDelete} transparent onMenuToggle={onMenuToggle} />
          </div>
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="max-w-[760px] mx-auto px-4 md:px-6 pt-16 pb-7 flex flex-col gap-4 md:gap-[22px]">
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
            travelers={travelers}
            placeholder="Reply to Glide..."
            disabled={isLoading || isUploading || isDocGenerating}
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
