import { useRef, useEffect } from "react";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Composer({ value, onChange, onSend, placeholder = "Ask Glide anything...", disabled }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      onSend();
    }
  }

  const hasContent = value.trim().length > 0;

  return (
    <div className="max-w-[760px] mx-auto w-full px-6 pb-3.5 pt-2 box-border">
      <div className="border border-slate-200 rounded-[20px] bg-white shadow-regular-md px-4 pt-3.5 pb-3 relative z-[1]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full box-border border-none outline-none resize-none bg-transparent text-base leading-6 tracking-tight text-slate-950 placeholder:text-slate-400 max-h-[120px]"
        />
        <div className="flex items-center gap-2 mt-2">
          <button className="w-9 h-9 rounded-full border-none bg-slate-50 text-slate-600 grid place-items-center text-[19px] cursor-pointer hover:bg-slate-200">
            <i className="ri-attachment-2" />
          </button>
          <button className="w-9 h-9 rounded-full border-none bg-slate-50 text-slate-600 grid place-items-center text-[19px] cursor-pointer hover:bg-slate-200">
            <i className="ri-mic-line" />
          </button>
          <button
            onClick={onSend}
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
