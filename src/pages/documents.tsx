import { useEffect, useCallback, useState, memo, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/use-auth";
import { getDocIcon } from "../components/icons/doc-icons";
import type { Document } from "../types";

const COUNTRY_FLAGS: Record<string, string> = {
  germany: "🇩🇪",
  france: "🇫🇷",
  italy: "🇮🇹",
  spain: "🇪🇸",
  netherlands: "🇳🇱",
  belgium: "🇧🇪",
  austria: "🇦🇹",
  switzerland: "🇨🇭",
  portugal: "🇵🇹",
  greece: "🇬🇷",
  usa: "🇺🇸",
  uk: "🇬🇧",
  canada: "🇨🇦",
  australia: "🇦🇺",
  japan: "🇯🇵",
  singapore: "🇸🇬",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  uploaded: { label: "Uploaded", color: "text-slate-500 bg-slate-50", icon: "ri-upload-cloud-2-fill" },
  verified: { label: "Verified", color: "text-green-700 bg-green-50", icon: "ri-checkbox-circle-fill" },
  processing: { label: "Processing", color: "text-blue-700 bg-blue-50", icon: "ri-loader-4-line" },
  rejected: { label: "Rejected", color: "text-red-700 bg-red-50", icon: "ri-close-circle-fill" },
};


function DocumentViewer({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const fileUrl = supabase.storage.from("documents").getPublicUrl(doc.storage_path).data.publicUrl;
  const isImage = doc.file_type.startsWith("image/");
  const isPdf = doc.file_type === "application/pdf";
  const isText = doc.file_type === "text/plain";
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (!isText) return;
    fetch(fileUrl)
      .then((res) => res.text())
      .then(setTextContent)
      .catch(() => setTextContent("Failed to load document content."));
  }, [fileUrl, isText]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] m-2 md:m-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-slate-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium tracking-tight truncate">{doc.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">{doc.file_name} · {(doc.file_size / 1024).toFixed(0)}KB</span>
              {doc.country && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="text-xs">{COUNTRY_FLAGS[doc.country.toLowerCase()] || "🏳️"}</span>
                  {doc.country}
                </span>
              )}
            </div>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium flex items-center gap-1.5 hover:bg-blue-100 transition no-underline"
          >
            <i className="ri-download-2-line text-sm" />
            Download
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 grid place-items-center hover:bg-slate-200 cursor-pointer border-none text-lg"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 grid place-items-center p-6">
          {isImage && (
            <img src={fileUrl} alt={doc.title} className="max-w-full max-h-[70vh] rounded-lg shadow-regular-md object-contain" />
          )}
          {isPdf && (
            <iframe src={fileUrl} title={doc.title} className="w-full h-[70vh] rounded-lg border border-slate-200" />
          )}
          {isText && (
            <pre className="w-full max-h-[70vh] overflow-auto p-5 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap font-mono">
              {textContent ?? "Loading..."}
            </pre>
          )}
          {!isImage && !isPdf && !isText && (
            <div className="text-center py-12">
              <i className="ri-file-line text-5xl text-slate-300" />
              <p className="text-sm text-slate-500 mt-3">Preview not available for this file type.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 px-4 h-9 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition no-underline"
              >
                <i className="ri-external-link-line" />
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DocumentCard = memo(function DocumentCard({ doc, onDelete, onView }: { doc: Document; onDelete: (doc: Document) => void; onView: (doc: Document) => void }) {
  const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.uploaded;
  const isImage = doc.file_type.startsWith("image/");
  const DocIcon = getDocIcon(doc.title);

  const thumbnailUrl = isImage
    ? supabase.storage.from("documents").getPublicUrl(doc.storage_path).data.publicUrl
    : null;

  return (
    <div
      onClick={() => onView(doc)}
      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-regular-xs hover:shadow-regular-md hover:-translate-y-0.5 transition-all group cursor-pointer"
    >
      <div className="h-[140px] bg-slate-50 grid place-items-center overflow-hidden relative">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={doc.title} className="max-h-[110px] rounded-[6px] shadow-regular-sm object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <DocIcon size={48} className="text-slate-400" />
            <span className="text-xs text-slate-400 px-3 text-center truncate max-w-full">{doc.file_name}</span>
          </div>
        )}
        <div className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
          <i className={`${status.icon} text-sm`} />
          {status.label}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
          className="absolute top-2.5 left-2.5 hidden group-hover:grid w-6 h-6 place-items-center rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm cursor-pointer shadow-regular-xs"
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>
      <div className="p-3 px-3.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium tracking-tight truncate">{doc.title}</h4>
          {doc.country && (
            <span className="flex-none flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
              <span className="text-xs">{COUNTRY_FLAGS[doc.country.toLowerCase()] || "🏳️"}</span>
              {doc.country}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">{(doc.file_size / 1024).toFixed(0)}KB</span>
      </div>
    </div>
  );
});

interface FolderViewProps {
  folderName: string;
  docs: Document[];
  onOpen: () => void;
  docCount: number;
}

const FolderCard = memo(function FolderCard({ folderName, docCount, onOpen }: FolderViewProps) {
  return (
    <button
      onClick={onOpen}
      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-regular-xs hover:shadow-regular-md hover:-translate-y-0.5 transition-all cursor-pointer text-left w-full"
    >
      <div className="h-[140px] bg-slate-50 grid place-items-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 grid place-items-center text-blue-600 font-display font-semibold text-xl">
          {folderName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
        </div>
      </div>
      <div className="p-3 px-3.5 flex flex-col gap-1">
        <h4 className="text-sm font-medium tracking-tight truncate">{folderName}</h4>
        <span className="text-xs text-slate-400">{docCount} document{docCount !== 1 ? "s" : ""}</span>
      </div>
    </button>
  );
});

export function DocumentsPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

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

  // Group documents by traveler_name (or "My Documents" if no traveler)
  const folders = useMemo(() => {
    const grouped: Record<string, Document[]> = {};
    for (const doc of documents) {
      const key = doc.traveler_name || "My Documents";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(doc);
    }
    return grouped;
  }, [documents]);

  const folderNames = Object.keys(folders);
  const currentFolderDocs = openFolder ? (folders[openFolder] || []) : [];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Mobile header bar */}
      {onMenuToggle && (
        <div className="flex items-center h-14 px-4 border-b border-slate-200 md:hidden flex-none">
          <button
            onClick={onMenuToggle}
            className="w-9 h-9 grid place-items-center rounded-[8px] border-none bg-transparent text-slate-600 text-xl cursor-pointer"
          >
            <i className="ri-menu-line" />
          </button>
          <span className="text-[15px] font-semibold ml-2">Documents</span>
        </div>
      )}
      <div className="max-w-[1040px] mx-auto p-5 md:p-9 md:px-10">
        {/* Header */}
        <div className="flex items-start gap-3 md:gap-4 mb-6">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-500 grid place-items-center text-xl md:text-[26px] flex-none">
            <i className="ri-folder-3-fill" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {openFolder && (
                <button
                  onClick={() => setOpenFolder(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none"
                >
                  <i className="ri-arrow-left-line text-xl" />
                </button>
              )}
              <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">
                {openFolder || "Documents"}
              </h1>
            </div>
            <p className="text-[15px] text-slate-600 mt-1">
              {openFolder
                ? `${currentFolderDocs.length} document${currentFolderDocs.length !== 1 ? "s" : ""} for ${openFolder}`
                : "All your uploaded and generated visa documents, organized by person."
              }
            </p>
          </div>
          <span className="text-sm text-slate-400 mt-2">{documents.length} total</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center text-slate-400 py-16 text-sm">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-12 text-center text-slate-400 bg-white">
            <i className="ri-file-add-line text-5xl" />
            <p className="mt-3 text-sm">No documents yet. Upload files in your chat conversations.</p>
          </div>
        ) : openFolder ? (
          /* Inside a folder — show documents */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {currentFolderDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} onView={setViewingDoc} />
            ))}
          </div>
        ) : (
          /* Folder view */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {folderNames.map((name) => (
              <FolderCard
                key={name}
                folderName={name}
                docs={folders[name]}
                docCount={folders[name].length}
                onOpen={() => setOpenFolder(name)}
              />
            ))}
          </div>
        )}
      </div>

      {viewingDoc && (
        <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </div>
  );
}
