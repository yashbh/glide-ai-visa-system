import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Traveler } from "../types";

export function useTravelers(userId: string) {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTravelers = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("travelers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (data) {
      // Deduplicate by name (in case of duplicates from multiple conversations)
      const unique = data.reduce((acc: Traveler[], t: Traveler) => {
        if (!acc.find((existing) => existing.name.toLowerCase() === t.name.toLowerCase())) {
          acc.push(t);
        }
        return acc;
      }, []);
      setTravelers(unique);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTravelers();
  }, [fetchTravelers]);

  const addTraveler = useCallback(async (name: string, relationship: string): Promise<Traveler | null> => {
    if (!userId) return null;
    // Check if already exists
    const existing = travelers.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const { data, error } = await supabase
      .from("travelers")
      .insert({ user_id: userId, name, relationship })
      .select()
      .single();

    if (error || !data) return null;
    const newTraveler = data as Traveler;
    setTravelers((prev) => [...prev, newTraveler]);
    return newTraveler;
  }, [userId, travelers]);

  const updateTraveler = useCallback(async (id: string, updates: { name?: string; relationship?: string }) => {
    await supabase.from("travelers").update(updates).eq("id", id);
    setTravelers((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } as Traveler : t));
  }, []);

  const deleteTraveler = useCallback(async (id: string) => {
    await supabase.from("travelers").delete().eq("id", id);
    setTravelers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { travelers, loading, fetchTravelers, addTraveler, updateTraveler, deleteTraveler };
}
