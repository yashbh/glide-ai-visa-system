import { useState, useCallback } from "react";

interface TravelerInput {
  name: string;
  relationship: string;
}

interface TravelerFormProps {
  country: string;
  existingTravelers?: { name: string; relationship: string }[];
  onSubmit: (travelers: TravelerInput[]) => void;
}

const RELATIONSHIPS = ["Self", "Spouse", "Child", "Parent", "Sibling", "Other"];

export function TravelerForm({ country, existingTravelers = [], onSubmit }: TravelerFormProps) {
  // Selected travelers (from existing list)
  const [selected, setSelected] = useState<TravelerInput[]>([]);
  // For adding brand new travelers not in the existing list
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("self");

  const toggleExisting = useCallback((traveler: TravelerInput) => {
    setSelected((prev) => {
      const exists = prev.find((t) => t.name === traveler.name);
      if (exists) {
        return prev.filter((t) => t.name !== traveler.name);
      }
      return [...prev, traveler];
    });
  }, []);

  const addNewTraveler = useCallback(() => {
    if (!newName.trim()) return;
    const traveler = { name: newName.trim(), relationship: newRelationship };
    setSelected((prev) => [...prev, traveler]);
    setNewName("");
    setNewRelationship("self");
  }, [newName, newRelationship]);

  const removeSelected = useCallback((name: string) => {
    setSelected((prev) => prev.filter((t) => t.name !== name));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) return;
    onSubmit(selected);
  }

  const countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);
  const unselectedExisting = existingTravelers.filter(
    (t) => !selected.find((s) => s.name === t.name)
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 grid place-items-center text-[26px] mx-auto mb-4">
            <i className="ri-group-line" />
          </div>
          <h1 className="font-display font-medium text-2xl tracking-tight">
            Who's traveling to {countryCapitalized}?
          </h1>
          <p className="text-[15px] text-slate-500 mt-2">
            Select travelers for this trip or add new ones.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Selected travelers as chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selected.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center gap-2 h-9 pl-3 pr-2 rounded-full bg-blue-50 border border-blue-200 text-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white grid place-items-center text-[10px] font-semibold">
                    {t.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                  <span className="text-slate-700 font-medium">{t.name}</span>
                  <span className="text-xs text-slate-400 capitalize">({t.relationship})</span>
                  <button
                    type="button"
                    onClick={() => removeSelected(t.name)}
                    className="w-5 h-5 rounded-full bg-transparent text-slate-400 hover:text-red-500 grid place-items-center cursor-pointer border-none text-sm"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Existing travelers to pick from */}
          {unselectedExisting.length > 0 && (
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Your travelers</label>
              <div className="flex flex-wrap gap-2">
                {unselectedExisting.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggleExisting(t)}
                    className="flex items-center gap-2 h-9 px-3 rounded-full border border-slate-200 bg-white text-sm text-slate-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 grid place-items-center text-[10px] font-semibold">
                      {t.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                    {t.name}
                    <i className="ri-add-line text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add new traveler */}
          <div className="mb-6">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Add new traveler</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNewTraveler(); } }}
                placeholder="Full name (as on passport)"
                className="flex-1 h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
              />
              <select
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
                className="h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r.toLowerCase()}>{r}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addNewTraveler}
                disabled={!newName.trim()}
                className="h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-slate-600 grid place-items-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="ri-add-line text-lg" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={selected.length === 0}
            className="w-full h-11 rounded-[10px] bg-blue-500 text-white text-sm font-medium shadow-regular-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i className="ri-arrow-right-line" />
            Start visa application ({selected.length} traveler{selected.length !== 1 ? "s" : ""})
          </button>
        </form>
      </div>
    </div>
  );
}
