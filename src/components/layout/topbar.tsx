import { useState, useRef, useEffect } from "react";
import type { Message } from "../../types";

interface TopbarProps {
  title: string;
  subtitle?: string;
  messages?: Message[];
  onDelete?: () => void;
}

export function Topbar({ title, subtitle, messages, onDelete }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  function exportChat() {
    if (!messages || messages.length === 0) return;

    const text = messages
      .filter((m) => m.role !== "system")
      .map((m) => {
        const role = m.role === "user" ? "You" : "Glide";
        return `${role}:\n${m.content}\n`;
      })
      .join("\n---\n\n");

    const header = `# ${title}\nExported from Glide — AI Visa Assistant\nDate: ${new Date().toLocaleDateString()}\n\n---\n\n`;
    const fullText = header + text;

    const blob = new Blob([fullText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-chat.md`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  }

  function handleDelete() {
    if (onDelete) {
      onDelete();
    }
    setMenuOpen(false);
  }

  return (
    <header className="flex items-center gap-2.5 h-14 px-5 border-b border-slate-200 flex-none">
      <span className="text-[15px] leading-5 text-slate-400 flex items-center gap-1.5">
        <span>Travel</span>
        <i className="ri-arrow-right-s-line text-lg" />
        <b className="text-slate-950 font-semibold">{title}</b>
        {subtitle && (
          <>
            <i className="ri-arrow-right-s-line text-lg" />
            <span>{subtitle}</span>
          </>
        )}
      </span>
      <span className="flex-1" />

      {/* Export button */}
      <button
        onClick={exportChat}
        title="Export chat"
        className="w-9 h-9 grid place-items-center rounded-[8px] border-none bg-transparent text-slate-600 text-xl cursor-pointer hover:bg-slate-50"
      >
        <i className="ri-share-line" />
      </button>

      {/* More menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 grid place-items-center rounded-[8px] border-none bg-transparent text-slate-600 text-xl cursor-pointer hover:bg-slate-50"
        >
          <i className="ri-more-2-fill" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 w-48 bg-white border border-slate-200 rounded-12 shadow-regular-md py-1.5 z-50">
            <button
              onClick={exportChat}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 border-none bg-transparent cursor-pointer text-left"
            >
              <i className="ri-download-2-line text-lg" />
              Export as Markdown
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 border-none bg-transparent cursor-pointer text-left"
              >
                <i className="ri-delete-bin-line text-lg" />
                Delete conversation
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
