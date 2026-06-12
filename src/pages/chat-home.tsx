import { Composer } from "../components/chat/composer";
import { useState } from "react";

interface ChatHomePageProps {
  onStartChat: (country: string) => void;
}

const DESTINATIONS = [
  { id: "germany", name: "Travel to Germany", flag: "🇩🇪", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=500&h=300&fit=crop", visa: "Schengen visa required" },
  { id: "france", name: "Travel to France", flag: "🇫🇷", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=300&fit=crop", visa: "Schengen visa required" },
  { id: "japan", name: "Travel to Japan", flag: "🇯🇵", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&h=300&fit=crop", visa: "Tourist visa required" },
];


export function ChatHomePage({ onStartChat }: ChatHomePageProps) {
  const [input, setInput] = useState("");

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    onStartChat("germany");
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-4 md:px-6">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 grid place-items-center text-slate-300 font-display font-bold text-xl md:text-2xl mb-2">
        G
      </div>
      <h1 className="font-display font-medium text-2xl md:text-[32px] leading-8 md:leading-10 tracking-tight">
        Where would you like to travel?
      </h1>
      <p className="text-base md:text-lg text-slate-400 tracking-tight">
        I'll guide you through the visa process step by step.
      </p>

      {/* Destination cards */}
      <div className="flex gap-3 md:gap-4 mt-4 md:mt-6 overflow-x-auto px-1 pb-1 w-full md:w-auto md:justify-center">
        {DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            onClick={() => onStartChat(dest.id)}
            className="flex-none w-[200px] md:w-[248px] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-regular-xs cursor-pointer hover:shadow-regular-md hover:-translate-y-0.5 transition-all text-left"
          >
            <div className="h-[100px] md:h-[132px] bg-cover bg-center" style={{ backgroundImage: `url(${dest.image})` }} />
            <div className="p-3 md:p-3.5 md:px-4">
              <h4 className="text-base md:text-lg font-medium tracking-tight">{dest.name}</h4>
              <div className="inline-flex items-center gap-2 mt-2 md:mt-2.5 py-1 px-2 pl-1 rounded-full bg-slate-50 text-xs text-slate-600">
                <span className="w-[18px] h-[18px] rounded-full grid place-items-center text-[11px] overflow-hidden shadow-[inset_0_0_0_1px_rgba(14,18,27,0.08)]">
                  {dest.flag}
                </span>
                {dest.visa}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="w-full mt-4">
        <Composer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          travelers={[]}
          placeholder="Ask Glide anything about visas..."
        />
      </div>
    </div>
  );
}
