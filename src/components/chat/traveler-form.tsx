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

export function TravelerForm({ country, existingTravelers, onSubmit }: TravelerFormProps) {
  const [travelers, setTravelers] = useState<TravelerInput[]>(() => {
    if (existingTravelers && existingTravelers.length > 0) {
      return existingTravelers.map((t) => ({ name: t.name, relationship: t.relationship }));
    }
    return [{ name: "", relationship: "self" }];
  });

  const addTraveler = useCallback(() => {
    setTravelers((prev) => [...prev, { name: "", relationship: "Spouse" }]);
  }, []);

  const removeTraveler = useCallback((index: number) => {
    setTravelers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateTraveler = useCallback((index: number, field: keyof TravelerInput, value: string) => {
    setTravelers((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = travelers.filter((t) => t.name.trim().length > 0);
    if (valid.length === 0) return;
    onSubmit(valid);
  }

  const countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);
  const allValid = travelers.every((t) => t.name.trim().length > 0);

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
            Add everyone who needs a visa. We'll organize documents by person.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 mb-5">
            {travelers.map((traveler, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={traveler.name}
                    onChange={(e) => updateTraveler(index, "name", e.target.value)}
                    placeholder="Full name (as on passport)"
                    required
                    className="w-full h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                  />
                </div>
                <select
                  value={traveler.relationship}
                  onChange={(e) => updateTraveler(index, "relationship", e.target.value)}
                  className="h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r.toLowerCase()}>{r}</option>
                  ))}
                </select>
                {travelers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTraveler(index)}
                    className="w-10 h-10 rounded-[10px] border border-slate-200 bg-white grid place-items-center text-slate-400 hover:text-red-500 hover:border-red-200 cursor-pointer flex-none"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTraveler}
            className="w-full h-9 rounded-[10px] border border-dashed border-slate-300 bg-white text-sm text-slate-500 font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition mb-6"
          >
            <i className="ri-add-line" />
            Add another traveler
          </button>

          <button
            type="submit"
            disabled={!allValid}
            className="w-full h-11 rounded-[10px] bg-blue-500 text-white text-sm font-medium shadow-regular-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i className="ri-arrow-right-line" />
            Start visa application
          </button>
        </form>
      </div>
    </div>
  );
}
