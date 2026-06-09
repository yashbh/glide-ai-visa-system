export function DocumentsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1040px] mx-auto p-9 px-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 grid place-items-center text-[26px] flex-none">
            <i className="ri-folder-3-fill" />
          </div>
          <div>
            <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">Documents</h1>
            <p className="text-[15px] text-slate-600 mt-1">All your uploaded and generated visa documents.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-400 bg-white">
            <i className="ri-file-add-line text-4xl" />
            <p className="mt-3 text-sm">Documents will appear here once you start a chat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
