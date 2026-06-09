import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Conversation } from "../types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (data) {
      setConversations(data as Conversation[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, refresh: fetchConversations };
}
