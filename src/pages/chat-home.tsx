import { Composer } from "../components/chat/composer";
import { useState } from "react";

interface ChatHomePageProps {
  onStartChat: (country: string) => void;
}

const DESTINATIONS = [
  { id: "germany", name: "Travel to Germany", flag: "🇩🇪", gradient: "linear-gradient(135deg, #FFD268, #E16614)" },
  { id: "france", name: "Travel to France", flag: "🇫🇷", gradient: "linear-gradient(135deg, #97BAFF, #335CFF)" },
  { id: "japan", name: "Travel to Japan", flag: "🇯🇵", gradient: "linear-gradient(135deg, #47C2FF, #1F7EAD)" },
];

const SUGGESTED_PROMPTS = [
  { icon: "ri-passport-line", text: "Check my visa eligibility" },
  { icon: "ri-file-list-3-line", text: "What documents do I need?" },
  { icon: "ri-time-line", text: "How long does processing take?" },
];

export function ChatHomePage({ onStartChat }: ChatHomePageProps) {
  const [input, setInput] = useState("");

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    onStartChat("germany");
  }

  function handlePromptClick(text: string) {
    setInput(text);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 grid place-items-center text-slate-300 font-display font-bold text-2xl mb-2">
        G
      </div>
      <h1 className="font-display font-medium text-[32px] leading-10 tracking-tight">
        Where would you like to travel?
      </h1>
      <p className="text-lg text-slate-400 tracking-tight">
        I'll guide you through the visa process step by step.
      </p>

      {/* Destination cards */}
      <div className="flex gap-4 mt-6 overflow-x-auto px-1 pb-1">
        {DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            onClick={() => onStartChat(dest.id)}
            className="flex-none w-[248px] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-regular-xs cursor-pointer hover:shadow-regular-md hover:-translate-y-0.5 transition-all text-left"
          >
            <div className="h-[132px]" style={{ background: dest.gradient }} />
            <div className="p-3.5 px-4">
              <h4 className="text-lg font-medium tracking-tight">{dest.name}</h4>
              <div className="inline-flex items-center gap-2 mt-2.5 py-1 px-2 pl-1 rounded-full bg-slate-50 text-xs text-slate-600">
                <span className="w-[18px] h-[18px] rounded-full grid place-items-center text-[11px] overflow-hidden shadow-[inset_0_0_0_1px_rgba(14,18,27,0.08)]">
                  {dest.flag}
                </span>
                Schengen visa required
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Suggested prompts */}
      <div className="flex gap-2 flex-wrap justify-center mt-4">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.text}
            onClick={() => handlePromptClick(prompt.text)}
            className="inline-flex items-center gap-1.5 py-[7px] px-3 rounded-full border border-slate-200 bg-white shadow-regular-xs text-[13px] font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
          >
            <i className={`${prompt.icon} text-base text-slate-400`} />
            {prompt.text}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="w-full mt-4">
        <Composer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask Glide anything about visas..."
        />
      </div>
    </div>
  );
}
