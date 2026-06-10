import { useState, useRef, useEffect, useCallback } from "react";
import { Composer } from "../components/chat/composer";
import type { AttachmentMeta } from "../components/chat/composer";
import { Message } from "../components/chat/message";
import { TypingIndicator } from "../components/chat/typing-indicator";
import { DocPanel } from "../components/chat/doc-panel";
import { TravelerForm } from "../components/chat/traveler-form";
import { Topbar } from "../components/layout/topbar";
import { useChat } from "../hooks/use-chat";
import { useDocuments } from "../hooks/use-documents";
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

// Extract traveler names from conversation (looks for user messages with names)
function extractTravelerNames(messages: { role: string; content: string }[]): string[] {
  const names: string[] = [];
  for (const msg of messages) {
    if (msg.role === "user") {
      // "My name is Yash Bhati" or "I'm Yash"
      const selfMatch = msg.content.match(/(?:my name is|I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (selfMatch?.[1] && !names.includes(selfMatch[1])) names.push(selfMatch[1]);
      // "traveling with Priya" or "with my wife Priya"
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
}

export function ChatPage({ conversationId, country, title, isNew, existingTravelers, onConversationCreated, onTravelersAdded, onDelete }: ChatPageProps) {
  const { user } = useAuth();
  const { messages, isLoading, historyLoaded, sendMessage } = useChat(conversationId);
  const { uploadDocument, isUploading } = useDocuments(user?.id || "", country);
  const [input, setInput] = useState("");
  const [docPanel, setDocPanel] = useState<{ title: string; body: string } | null>(null);
  const [isDocGenerating, setIsDocGenerating] = useState(false);
  const [travelers, setTravelers] = useState<string[]>(existingTravelers.map((t) => t.name));
  const [showTravelerForm, setShowTravelerForm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

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

  // Show traveler form for new conversations (if no existing travelers), or start chat for existing ones
  useEffect(() => {
    if (!historyLoaded || hasSentInitial.current) return;
    if (isNew && messages.length === 0) {
      if (existingTravelers.length > 0) {
        // Already have travelers registered — skip form, go straight to chat
        setShowTravelerForm(true);
      } else {
        setShowTravelerForm(true);
      }
    } else if (!isNew) {
      // For existing conversations, use existing travelers from parent
      if (existingTravelers.length === 0) {
        const names = extractTravelerNames(messages);
        if (names.length > 0) setTravelers(names);
      }
    }
  }, [historyLoaded, isNew, messages.length, existingTravelers]);

  const handleTravelerSubmit = useCallback(async (travelerList: { name: string; relationship: string }[]) => {
    setShowTravelerForm(false);
    const names = travelerList.map((t) => t.name.trim());
    setTravelers(names);
    hasSentInitial.current = true;

    // Add new travelers to the global list (saves to Supabase via parent)
    await onTravelersAdded(travelerList);

    // Start conversation with traveler info
    const travelerInfo = travelerList.length === 1
      ? `Hi! My name is ${travelerList[0].name} and I'm interested in traveling to ${country}.`
      : `Hi! I'm ${travelerList[0].name} and I'm traveling to ${country} with ${travelerList.slice(1).map((t) => `${t.name} (${t.relationship})`).join(", ")}.`;

    sendMessage(travelerInfo).then(() => {
      onConversationCreated();
    });
  }, [user, conversationId, country, sendMessage, onConversationCreated]);

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
        sendMessage(fileMsg);
      }
      return;
    }

    // Check if user is asking for a document generation
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

  if (showTravelerForm) {
    return <TravelerForm country={country} existingTravelers={existingTravelers} onSubmit={handleTravelerSubmit} />;
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
