import { useState, useCallback, useEffect, memo } from "react";
import Markdown from "react-markdown";

interface DocPanelProps {
  title: string;
  content: string;
  isGenerating?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (editedContent: string) => void;
}

export const DocPanel = memo(function DocPanel({ title, content, isGenerating, isOpen, onClose, onApprove }: DocPanelProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleApprove = useCallback(async () => {
    setIsSaving(true);
    await onApprove(editedContent);
    setIsSaving(false);
  }, [editedContent, onApprove]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleDoneEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="w-[520px] flex-none border-l border-slate-200 bg-white flex flex-col overflow-hidden animate-[slideIn_0.28s_cubic-bezier(0.4,0,0.2,1)]">
      {/* Header */}
      <div className="flex items-center gap-2 h-14 px-5 border-b border-slate-200 flex-none">
        <span className="text-[15px] text-slate-400 flex items-center gap-1.5">
          <span>Document</span>
          <i className="ri-arrow-right-s-line text-lg" />
          <b className="text-slate-950 font-semibold">{title}</b>
        </span>
        <span className="flex-1" />
        {isGenerating && (
          <span className="text-xs text-blue-500 font-medium flex items-center gap-1.5 mr-2">
            <i className="ri-loader-4-line animate-spin" />
            Generating...
          </span>
        )}
        <button
          onClick={onClose}
          className="w-8 h-8 grid place-items-center rounded-[8px] border-none bg-transparent text-slate-400 text-xl cursor-pointer hover:bg-slate-50 hover:text-slate-600"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {isGenerating && !content ? (
          <div className="bg-white border border-slate-200 rounded-[12px] shadow-regular-sm p-6 flex flex-col items-center justify-center min-h-[300px] gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 grid place-items-center">
              <i className="ri-file-text-line text-xl text-blue-500 animate-pulse" />
            </div>
            <p className="text-sm text-slate-500">Generating your document...</p>
            <p className="text-xs text-slate-400">This may take a few seconds</p>
          </div>
        ) : isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[400px] p-5 bg-white border border-slate-200 rounded-[12px] text-sm leading-6 text-slate-950 resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-[12px] shadow-regular-sm p-6">
            <div className="prose prose-sm max-w-none text-sm leading-7 text-slate-950 prose-headings:font-display prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-slate-950">
              <Markdown>{editedContent}</Markdown>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 justify-end px-5 py-3.5 border-t border-slate-200 flex-none">
        {isEditing ? (
          <button
            onClick={handleDoneEditing}
            className="h-9 px-4 rounded-[10px] border border-slate-200 bg-white text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 shadow-regular-xs"
          >
            Done Editing
          </button>
        ) : (
          <button
            onClick={handleEdit}
            disabled={isGenerating || !content}
            className="h-9 px-4 rounded-[10px] border border-slate-200 bg-white text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 shadow-regular-xs flex items-center gap-2 disabled:opacity-50"
          >
            <i className="ri-edit-line" />
            Edit
          </button>
        )}
        <button
          onClick={handleApprove}
          disabled={isGenerating || !content || isSaving}
          className="h-9 px-4 rounded-[10px] border-none bg-blue-500 text-sm font-medium text-white cursor-pointer hover:bg-blue-600 shadow-regular-sm flex items-center gap-2 disabled:opacity-50"
        >
          <i className={isSaving ? "ri-loader-4-line animate-spin" : "ri-check-line"} />
          {isSaving ? "Saving..." : "Approve"}
        </button>
      </div>
    </div>
  );
});
