import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const IS_MOCK_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === "https://placeholder.supabase.co";

const MOCK_USER = {
  id: "mock-user-id",
  email: "demo@glide.app",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

export function useAuth() {
  const [user, setUser] = useState<User | null>(IS_MOCK_MODE ? MOCK_USER : null);
  const [loading, setLoading] = useState(!IS_MOCK_MODE);

  useEffect(() => {
    if (IS_MOCK_MODE) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    if (IS_MOCK_MODE) {
      setUser(MOCK_USER);
      return null;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    if (IS_MOCK_MODE) {
      setUser(MOCK_USER);
      return null;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }

  async function signOut() {
    if (IS_MOCK_MODE) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  }

  return { user, loading, signIn, signUp, signOut };
}
