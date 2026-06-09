import { useEffect, useCallback, useState, memo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/use-auth";
import type { Document } from "../types";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  uploaded: { label: "Uploaded", color: "text-slate-500 bg-slate-50", icon: "ri-upload-cloud-2-fill" },
  verified: { label: "Verified", color: "text-green-700 bg-green-50", icon: "ri-checkbox-circle-fill" },
  processing: { label: "Processing", color: "text-blue-700 bg-blue-50", icon: "ri-loader-4-line" },
  rejected: { label: "Rejected", color: "text-red-700 bg-red-50", icon: "ri-close-circle-fill" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  germany: "🇩🇪",
  france: "🇫🇷",
  japan: "🇯🇵",
  india: "🇮🇳",
};

const FILE_ICONS: Record<string, string> = {
  "application/pdf": "ri-file-pdf-2-line",
  "text/plain": "ri-file-text-line",
  "image/jpeg": "ri-image-line",
  "image/png": "ri-image-line",
};

const DocumentCard = memo(function DocumentCard({ doc, onDelete }: { doc: Document; onDelete: (doc: Document) => void }) {
  const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.uploaded;
  const flag = COUNTRY_FLAGS[doc.country] || "📄";
  const isImage = doc.file_type.startsWith("image/");
  const fileIcon = FILE_ICONS[doc.file_type] || "ri-file-line";

  const thumbnailUrl = isImage
    ? supabase.storage.from("documents").getPublicUrl(doc.storage_path).data.publicUrl
    : null;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-regular-xs hover:shadow-regular-md hover:-translate-y-0.5 transition-all group">
      <div className="h-[170px] bg-slate-50 grid place-items-center overflow-hidden relative">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={doc.title} className="max-h-[138px] rounded-[6px] shadow-regular-sm object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <i className={`${fileIcon} text-5xl`} />
            <span className="text-xs text-slate-400">{doc.file_name}</span>
          </div>
        )}
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
          <i className={`${status.icon} text-sm`} />
          {status.label}
        </div>
        <button
          onClick={() => onDelete(doc)}
          className="absolute top-3 left-3 hidden group-hover:grid w-7 h-7 place-items-center rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm cursor-pointer shadow-regular-xs"
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>
      <div className="p-3.5 px-4 flex flex-col gap-2.5">
        <h4 className="text-base font-medium tracking-tight truncate">{doc.title}</h4>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 py-0.5 px-2 pl-1 rounded-full bg-slate-50 text-xs text-slate-600">
            <span className="text-[11px]">{flag}</span>
            {doc.country.charAt(0).toUpperCase() + doc.country.slice(1)}
          </div>
          <span className="text-xs text-slate-400">{(doc.file_size / 1024).toFixed(0)}KB</span>
        </div>
      </div>
    </div>
  );
});

export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (!cancelled && data) setDocuments(data as Document[]);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const handleDelete = useCallback(async (doc: Document) => {
    await supabase.storage.from("documents").remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1040px] mx-auto p-9 px-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 grid place-items-center text-[26px] flex-none">
            <i className="ri-folder-3-fill" />
          </div>
          <div className="flex-1">
            <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">Documents</h1>
            <p className="text-[15px] text-slate-600 mt-1">All your uploaded and generated visa documents.</p>
          </div>
          <span className="text-sm text-slate-400 mt-2">{documents.length} document{documents.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-16 text-sm">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-12 text-center text-slate-400 bg-white">
            <i className="ri-file-add-line text-5xl" />
            <p className="mt-3 text-sm">No documents yet. Upload files in your chat conversations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
