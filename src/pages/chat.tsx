import { useState, useRef, useEffect, useCallback } from "react";
import { Composer } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { DocPanel } from "../components/chat/doc-panel";
import { Topbar } from "../components/layout/topbar";
import { useChat } from "../hooks/use-chat";
import { useDocuments, detectDocType, detectTravelerName } from "../hooks/use-documents";
import { useAuth } from "../hooks/use-auth";
import { generateDocument } from "../lib/api";

const DOC_TRIGGER_PATTERNS = [
  "create a cover letter",
  "generate a cover letter",
  "draft a cover letter",
  "write a cover letter",
  "make a cover letter",
  "create cover letter",
  "generate cover letter",
  "prepare a cover letter",
  "create a itinerary",
  "generate a itinerary",
  "create an itinerary",
  "generate an itinerary",
  "draft an itinerary",
  "write an itinerary",
  "make an itinerary",
  "create itinerary",
  "plan my itinerary",
];

function detectDocRequest(message: string): { type: "cover_letter" | "itinerary" } | null {
  const lower = message.toLowerCase();
  for (const pattern of DOC_TRIGGER_PATTERNS) {
    if (lower.includes(pattern)) {
      return { type: lower.includes("itinerary") ? "itinerary" : "cover_letter" };
    }
  }
  return null;
}

// Extract traveler names mentioned in conversation (from AI messages that confirm names)
function extractTravelerNames(messages: { role: string; content: string }[]): string[] {
  const names: string[] = [];

  for (const msg of messages) {
    if (msg.role === "user") {
      // Look for patterns like "I'm traveling with Priya and Ravi"
      const withMatch = msg.content.match(/(?:with|and)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g);
      if (withMatch) {
        for (const match of withMatch) {
          const name = match.replace(/^(?:with|and)\s+/, "").trim();
          if (name.length > 1 && name.length < 30 && !names.includes(name)) {
            names.push(name);
          }
        }
      }
      // Look for "my name is X" or "I'm X"
      const selfMatch = msg.content.match(/(?:my name is|I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (selfMatch && selfMatch[1] && !names.includes(selfMatch[1])) {
        names.push(selfMatch[1]);
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
  onConversationCreated: () => void;
  onDelete: () => void;
}

export function ChatPage({ conversationId, country, title, isNew, onConversationCreated, onDelete }: ChatPageProps) {
  const { user } = useAuth();
  const { messages, isLoading, historyLoaded, sendMessage } = useChat(conversationId);
  const { uploadDocument, isUploading } = useDocuments(user?.id || "", country);
  const [input, setInput] = useState("");
  const [docPanel, setDocPanel] = useState<{ title: string; body: string } | null>(null);
  const [isDocGenerating, setIsDocGenerating] = useState(false);
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
      sendMessage(`Hi! I'm interested in traveling to ${country}.`).then(() => {
        onConversationCreated();
      });
    }
  }, [historyLoaded, isNew, messages.length, country, sendMessage, onConversationCreated]);

  const handleSend = useCallback(async (attachedFile?: File) => {
    const trimmed = input.trim();
    const hasContent = trimmed.length > 0 || attachedFile;
    if (!hasContent) return;
    setInput("");

    // If there's an attached file, detect doc type + traveler from message, then upload
    if (attachedFile) {
      // Detect document type from message or filename
      const docType = detectDocType(trimmed) || detectDocType(attachedFile.name);

      // Try to detect whose document this is from the message
      // Extract known traveler names from conversation history
      const knownNames = extractTravelerNames(messages);
      const detectedTraveler = trimmed ? detectTravelerName(trimmed, knownNames) : null;

      // Resolve traveler name
      let travelerName: string | undefined;
      if (detectedTraveler === "__self__") {
        // Use first known name (the user usually gives their name first)
        travelerName = knownNames.length > 0 ? knownNames[0] : undefined;
      } else if (detectedTraveler === "__spouse__" || detectedTraveler === "__child__") {
        // Try to find spouse/child name from known names (usually second+)
        travelerName = knownNames.length > 1 ? knownNames[1] : undefined;
      } else if (detectedTraveler) {
        travelerName = detectedTraveler;
      }

      const { document: doc, error } = await uploadDocument(attachedFile, conversationId, {
        travelerName,
        docType: docType || undefined,
      });

      if (error) {
        sendMessage(`[Upload failed: ${error}]`);
        return;
      }
      if (doc) {
        const sizeKB = (doc.file_size / 1024).toFixed(0);
        const docLabel = docType || doc.title;
        const ownerLabel = travelerName ? ` (${travelerName}'s)` : "";
        const fileMsg = trimmed
          ? `${trimmed}\n\n[Attached: ${docLabel}${ownerLabel} — ${doc.file_type}, ${sizeKB}KB]`
          : `I've uploaded a document: ${docLabel}${ownerLabel} (${doc.file_type}, ${sizeKB}KB)`;
        sendMessage(fileMsg);
      }
      return;
    }

    // Check if user is asking for a document
    const docRequest = detectDocRequest(trimmed);
    if (docRequest) {
      await sendMessage(trimmed);

      const conversationContext = messages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .slice(-10)
        .join("\n");

      const docTitle = docRequest.type === "cover_letter"
        ? `${country.charAt(0).toUpperCase() + country.slice(1)} Cover Letter`
        : `${country.charAt(0).toUpperCase() + country.slice(1)} Travel Itinerary`;

      setDocPanel({ title: docTitle, body: "" });
      setIsDocGenerating(true);

      const result = await generateDocument({
        doc_type: docRequest.type,
        country,
        context: conversationContext,
      });

      setIsDocGenerating(false);

      if (result.error) {
        setDocPanel(null);
        sendMessage(`Sorry, I couldn't generate the document: ${result.error}`);
      } else {
        setDocPanel({ title: result.title, body: result.document });
      }
      return;
    }

    // Normal message
    sendMessage(trimmed);
  }, [input, sendMessage, messages, country, uploadDocument, conversationId]);

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
            <Topbar title={title} messages={messages} onDelete={onDelete} transparent />
          </div>
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="max-w-[760px] mx-auto px-6 pt-16 pb-7 flex flex-col gap-[22px]">
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
