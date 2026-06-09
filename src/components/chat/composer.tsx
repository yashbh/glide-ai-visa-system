import { useRef, useEffect, useState, useCallback } from "react";
import { validateFile } from "../../hooks/use-documents";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileAttach?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Composer({ value, onChange, onSend, onFileAttach, placeholder = "Ask Glide anything...", disabled }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    stopListening();
    onSend();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onFileAttach) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }
    onFileAttach(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !onFileAttach) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }
    onFileAttach(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
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

  const hasContent = value.trim().length > 0;

  return (
    <div className="max-w-[760px] mx-auto w-full px-6 pb-3.5 pt-2 box-border">
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
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... speak now" : placeholder}
          disabled={disabled}
          rows={1}
          className="w-full box-border border-none outline-none resize-none bg-transparent text-base leading-6 tracking-tight text-slate-950 placeholder:text-slate-400 max-h-[120px]"
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
