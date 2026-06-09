export function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1040px] mx-auto p-9 px-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 grid place-items-center text-[26px] flex-none">
            <i className="ri-dashboard-fill" />
          </div>
          <div>
            <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">Dashboard</h1>
            <p className="text-[15px] text-slate-600 mt-1">Overview of your visa application progress.</p>
          </div>
        </div>
        <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-400 bg-white">
          <i className="ri-bar-chart-line text-4xl" />
          <p className="mt-3 text-sm">Dashboard coming soon — start a conversation first.</p>
        </div>
      </div>
    </div>
  );
}
