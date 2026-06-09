import { useState, useCallback } from "react";
import type { Traveler } from "../types";

interface TravelersPageProps {
  travelers: Traveler[];
  onAdd: (name: string, relationship: string) => Promise<Traveler | null>;
  onUpdate: (id: string, updates: { name?: string; relationship?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const RELATIONSHIPS = ["self", "spouse", "child", "parent", "sibling", "other"];

export function TravelersPage({ travelers, onAdd, onUpdate, onDelete }: TravelersPageProps) {
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("self");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRelationship, setEditRelationship] = useState("");

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) return;
    await onAdd(newName.trim(), newRelationship);
    setNewName("");
    setNewRelationship("self");
  }, [newName, newRelationship, onAdd]);

  const startEdit = useCallback((traveler: Traveler) => {
    setEditingId(traveler.id);
    setEditName(traveler.name);
    setEditRelationship(traveler.relationship);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingId || !editName.trim()) return;
    await onUpdate(editingId, { name: editName.trim(), relationship: editRelationship });
    setEditingId(null);
  }, [editingId, editName, editRelationship, onUpdate]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[640px] mx-auto p-9 px-10">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 grid place-items-center text-[26px] flex-none">
            <i className="ri-group-fill" />
          </div>
          <div>
            <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">Travelers</h1>
            <p className="text-[15px] text-slate-600 mt-1">Manage people in your visa applications. Documents are organized by traveler.</p>
          </div>
        </div>

        {/* Add new traveler */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Full name (as on passport)"
            className="flex-1 h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
          />
          <select
            value={newRelationship}
            onChange={(e) => setNewRelationship(e.target.value)}
            className="h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="h-10 px-4 rounded-[10px] bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <i className="ri-add-line" />
            Add
          </button>
        </div>

        {/* Traveler list */}
        {travelers.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-10 text-center text-slate-400 bg-white">
            <i className="ri-user-add-line text-4xl" />
            <p className="mt-3 text-sm">No travelers yet. Add yourself and your travel companions.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {travelers.map((traveler) => (
              <div
                key={traveler.id}
                className="flex items-center gap-3 p-3 px-4 bg-white border border-slate-200 rounded-[12px] group"
              >
                {editingId === traveler.id ? (
                  /* Edit mode */
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="flex-1 h-8 px-2 rounded-[6px] border border-slate-200 text-sm text-slate-950 outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <select
                      value={editRelationship}
                      onChange={(e) => setEditRelationship(e.target.value)}
                      className="h-8 px-2 rounded-[6px] border border-slate-200 text-xs text-slate-700 outline-none cursor-pointer"
                    >
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                    <button onClick={saveEdit} className="w-8 h-8 rounded-[6px] bg-blue-500 text-white grid place-items-center text-sm cursor-pointer">
                      <i className="ri-check-line" />
                    </button>
                    <button onClick={cancelEdit} className="w-8 h-8 rounded-[6px] border border-slate-200 text-slate-400 grid place-items-center text-sm cursor-pointer hover:text-slate-600">
                      <i className="ri-close-line" />
                    </button>
                  </>
                ) : (
                  /* View mode */
                  <>
                    <div className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center text-slate-500 text-lg flex-none">
                      <i className="ri-user-3-line" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-950 truncate">{traveler.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{traveler.relationship}</div>
                    </div>
                    <button
                      onClick={() => startEdit(traveler)}
                      className="w-8 h-8 rounded-[6px] border-none bg-transparent text-slate-400 grid place-items-center text-sm cursor-pointer hover:bg-slate-50 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="ri-edit-line" />
                    </button>
                    <button
                      onClick={() => onDelete(traveler.id)}
                      className="w-8 h-8 rounded-[6px] border-none bg-transparent text-slate-400 grid place-items-center text-sm cursor-pointer hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
