export function TypingIndicator() {
  return (
    <div className="self-start flex gap-1 py-1">
      <i className="w-[7px] h-[7px] rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
      <i className="w-[7px] h-[7px] rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
      <i className="w-[7px] h-[7px] rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}
