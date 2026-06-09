import { useState, useCallback, memo } from "react";

interface DocPanelProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (editedContent: string) => void;
}

export const DocPanel = memo(function DocPanel({ title, content, isOpen, onClose, onApprove }: DocPanelProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);

  const handleApprove = useCallback(() => {
    onApprove(editedContent);
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
        <button
          onClick={onClose}
          className="w-8 h-8 grid place-items-center rounded-[8px] border-none bg-transparent text-slate-400 text-xl cursor-pointer hover:bg-slate-50 hover:text-slate-600"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[400px] p-5 bg-white border border-slate-200 rounded-12 text-sm leading-6 text-slate-950 resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-12 shadow-regular-sm p-6">
            <div className="text-sm leading-7 text-slate-950 whitespace-pre-wrap font-sans">
              {editedContent}
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
            className="h-9 px-4 rounded-[10px] border border-slate-200 bg-white text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 shadow-regular-xs flex items-center gap-2"
          >
            <i className="ri-edit-line" />
            Edit
          </button>
        )}
        <button
          onClick={handleApprove}
          className="h-9 px-4 rounded-[10px] border-none bg-blue-500 text-sm font-medium text-white cursor-pointer hover:bg-blue-600 shadow-regular-sm flex items-center gap-2"
        >
          <i className="ri-check-line" />
          Approve
        </button>
      </div>
    </div>
  );
});
