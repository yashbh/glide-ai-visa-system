interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="flex items-center gap-2.5 h-14 px-5 border-b border-slate-200 flex-none">
      <span className="text-[15px] text-slate-400 flex items-center gap-1.5">
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
      <button className="w-9 h-9 grid place-items-center rounded-[8px] border-none bg-transparent text-slate-600 text-xl cursor-pointer hover:bg-slate-50">
        <i className="ri-share-line" />
      </button>
      <button className="w-9 h-9 grid place-items-center rounded-[8px] border-none bg-transparent text-slate-600 text-xl cursor-pointer hover:bg-slate-50">
        <i className="ri-more-2-fill" />
      </button>
    </header>
  );
}
