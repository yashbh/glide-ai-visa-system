import { memo } from "react";
import Markdown from "react-markdown";
import type { Message as MessageType } from "../../types";

interface MessageProps {
  message: MessageType;
}

function UserMessage({ content }: { content: string }) {
  // Check if message has an attachment tag
  const attachMatch = content.match(/\[Attached: (.+?) — (.+?), (.+?)\]/);
  const textContent = content.replace(/\n?\n?\[Attached: .+?\]/, "").trim();

  if (attachMatch) {
    const [, docType, fileType] = attachMatch;
    const isImage = fileType.startsWith("image/");
    return (
      <div className="self-end max-w-[78%] flex flex-col gap-2">
        <div className="bg-slate-900 text-white rounded-[20px] px-[18px] py-3 text-[15px] leading-6 tracking-[-0.011em]">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-[6px] grid place-items-center ${isImage ? "bg-blue-500/20" : "bg-red-500/20"}`}>
              <i className={`${isImage ? "ri-image-line text-blue-300" : "ri-file-pdf-2-line text-red-300"} text-base`} />
            </div>
            <span className="text-sm font-medium text-slate-200">{docType}</span>
          </div>
          {textContent && <p className="mt-1.5">{textContent}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="self-end max-w-[78%] bg-slate-900 text-white rounded-[20px] px-[18px] py-3 text-[15px] leading-6 tracking-[-0.011em]">
      {content}
    </div>
  );
}

export const Message = memo(function Message({ message }: MessageProps) {
  if (message.role === "user") {
    return <UserMessage content={message.content} />;
  }

  return (
    <div className="self-start max-w-[92%] flex flex-col gap-2.5">
      <div className="prose prose-sm max-w-none text-[15px] leading-[26px] tracking-[-0.011em] text-slate-950 prose-headings:font-display prose-headings:text-slate-950 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-slate-950">
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
});
