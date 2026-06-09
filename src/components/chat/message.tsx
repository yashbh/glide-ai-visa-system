import Markdown from "react-markdown";
import type { Message as MessageType } from "../../types";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  if (message.role === "user") {
    return (
      <div className="self-end max-w-[78%] bg-blue-500/10 text-blue-700 rounded-[20px] px-[18px] py-3 text-base leading-6 tracking-tight">
        {message.content}
      </div>
    );
  }

  return (
    <div className="self-start max-w-[92%] flex flex-col gap-2.5">
      <div className="prose prose-sm max-w-none text-base leading-[26px] tracking-tight text-slate-950 prose-headings:font-display prose-headings:text-slate-950 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-slate-950">
        <Markdown>{message.content}</Markdown>
      </div>
      <div className="flex gap-0.5">
        <button className="w-[30px] h-[30px] grid place-items-center rounded-[6px] border-none bg-transparent text-slate-400 text-[17px] cursor-pointer hover:bg-slate-50 hover:text-slate-600">
          <i className="ri-file-copy-line" />
        </button>
        <button className="w-[30px] h-[30px] grid place-items-center rounded-[6px] border-none bg-transparent text-slate-400 text-[17px] cursor-pointer hover:bg-slate-50 hover:text-slate-600">
          <i className="ri-thumb-up-line" />
        </button>
        <button className="w-[30px] h-[30px] grid place-items-center rounded-[6px] border-none bg-transparent text-slate-400 text-[17px] cursor-pointer hover:bg-slate-50 hover:text-slate-600">
          <i className="ri-thumb-down-line" />
        </button>
      </div>
    </div>
  );
}
