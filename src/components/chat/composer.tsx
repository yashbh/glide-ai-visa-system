import { useRef, useEffect, useState, useCallback } from "react";
import { validateFile } from "../../hooks/use-documents";

const DOC_TYPES = [
  "Passport",
  "Passport Photo",
  "Bank Statement",
  "Salary Slip",
  "ITR",
  "Travel Insurance",
  "Flight Booking",
  "Hotel Booking",
  "Employment Letter",
  "Leave Approval",
  "Cover Letter",
  "Travel Itinerary",
  "No Objection Certificate",
  "Other",
];

interface AttachmentMeta {
  file: File;
  docType: string;
  travelerName: string;
}

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (attachment?: AttachmentMeta) => void;
  travelers: string[];
  placeholder?: string;
  disabled?: boolean;
}

export type { AttachmentMeta };

export function Composer({ value, onChange, onSend, travelers, placeholder = "Ask Glide anything...", disabled }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState("Passport");
  const [selectedTraveler, setSelectedTraveler] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [value]);

  // Set default traveler when travelers list changes
  useEffect(() => {
    if (travelers.length > 0 && !selectedTraveler) {
      setSelectedTraveler(travelers[0]);
    }
  }, [travelers, selectedTraveler]);

  // Generate preview URL for images
  useEffect(() => {
    if (!attachedFile) {
      setFilePreview(null);
      return;
    }
    if (attachedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(attachedFile);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreview(null);
  }, [attachedFile]);

  // Auto-detect doc type from filename
  useEffect(() => {
    if (!attachedFile) return;
    const name = attachedFile.name.toLowerCase();
    if (name.includes("passport")) setSelectedDocType("Passport");
    else if (name.includes("bank") || name.includes("statement")) setSelectedDocType("Bank Statement");
    else if (name.includes("salary") || name.includes("slip")) setSelectedDocType("Salary Slip");
    else if (name.includes("itr") || name.includes("tax")) setSelectedDocType("ITR");
    else if (name.includes("insurance")) setSelectedDocType("Travel Insurance");
    else if (name.includes("flight") || name.includes("ticket")) setSelectedDocType("Flight Booking");
    else if (name.includes("hotel") || name.includes("booking")) setSelectedDocType("Hotel Booking");
  }, [attachedFile]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    stopListening();
    const hasContent = value.trim().length > 0 || attachedFile;
    if (!hasContent) return;

    if (attachedFile) {
      onSend({
        file: attachedFile,
        docType: selectedDocType,
        travelerName: selectedTraveler || travelers[0] || "General",
      });
    } else {
      onSend(undefined);
    }
    setAttachedFile(null);
    setFilePreview(null);
  }

  function attachFile(file: File) {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }
    setAttachedFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    attachFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    attachFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function removeAttachment() {
    setAttachedFile(null);
    setFilePreview(null);
  }

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = value;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript;
          onChange(finalTranscript);
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        onChange(finalTranscript + (finalTranscript ? " " : "") + interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [value, onChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  function toggleVoice() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  const hasContent = value.trim().length > 0 || attachedFile !== null;

  return (
    <div className="max-w-[760px] mx-auto w-full px-3 md:px-6 pb-3 md:pb-3.5 pt-2 box-border">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border rounded-[20px] bg-white shadow-regular-md px-4 pt-3.5 pb-3 relative z-[1] transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50/50 shadow-[0_0_0_3px_rgba(51,92,255,0.1)]"
            : isListening
              ? "border-red-300 shadow-[0_0_0_3px_rgba(251,55,72,0.1)]"
              : "border-slate-200"
        }`}
      >
        {isDragOver && (
          <div className="absolute inset-0 rounded-[20px] grid place-items-center bg-blue-50/80 z-10 pointer-events-none">
            <div className="text-blue-500 text-sm font-medium flex items-center gap-2">
              <i className="ri-upload-2-line text-lg" />
              Drop file here (PDF, JPEG, PNG)
            </div>
          </div>
        )}

        {/* Attachment preview with doc type + person selectors */}
        {attachedFile && (
          <div className="mb-3 p-3 bg-slate-50 rounded-[12px] border border-slate-100">
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div className="relative flex-none">
                {filePreview ? (
                  <img src={filePreview} alt={attachedFile.name} className="h-14 w-14 object-cover rounded-[8px] border border-slate-200" />
                ) : (
                  <div className="h-14 w-14 rounded-[8px] border border-slate-200 bg-red-50 grid place-items-center">
                    <i className="ri-file-pdf-2-line text-xl text-red-500" />
                  </div>
                )}
                <button
                  onClick={removeAttachment}
                  className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-slate-900 text-white grid place-items-center text-[10px] cursor-pointer border-2 border-white"
                >
                  <i className="ri-close-line" />
                </button>
              </div>

              {/* File info + selectors */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700 truncate">{attachedFile.name}</span>
                  <span className="text-xs text-slate-400 flex-none">{(attachedFile.size / 1024).toFixed(0)} KB</span>
                </div>

                <div className="flex gap-2">
                  {/* Doc type selector */}
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="h-7 px-2 text-xs rounded-[6px] border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {DOC_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  {/* Person selector */}
                  {travelers.length > 0 && (
                    <select
                      value={selectedTraveler}
                      onChange={(e) => setSelectedTraveler(e.target.value)}
                      className="h-7 px-2 text-xs rounded-[6px] border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {travelers.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... speak now" : attachedFile ? "Add a note (optional)..." : placeholder}
          disabled={disabled}
          rows={1}
          className="w-full box-border border-none outline-none resize-none bg-transparent text-base leading-6 tracking-[-0.011em] text-slate-950 placeholder:text-slate-400 max-h-[120px]"
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-9 h-9 rounded-full border-none bg-slate-50 text-slate-600 grid place-items-center text-[19px] cursor-pointer hover:bg-slate-200 disabled:opacity-50"
          >
            <i className="ri-attachment-2" />
          </button>
          <button
            onClick={toggleVoice}
            className={`w-9 h-9 rounded-full border-none grid place-items-center text-[19px] cursor-pointer transition-colors ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-slate-50 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <i className={isListening ? "ri-stop-fill" : "ri-mic-line"} />
          </button>
          <button
            onClick={handleSend}
            disabled={!hasContent || disabled}
            className={`ml-auto w-9 h-9 rounded-full border-none grid place-items-center text-[19px] cursor-pointer transition ${
              hasContent
                ? "bg-slate-950 text-white"
                : "bg-slate-200 text-slate-400"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <i className="ri-arrow-up-line" />
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 pt-2">
        Glide can make mistakes. Verify important visa information independently.
      </p>
    </div>
  );
}
