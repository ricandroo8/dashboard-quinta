import { useCallback, useEffect, useMemo, useState } from "react";

import AuthContext from "./authContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (sessionError) {
          setError("Impossibile verificare la sessione. Riprova tra poco.");
        }

        setSession(data.session ?? null);
      } catch {
        if (isMounted) {
          setError("Impossibile verificare la sessione. Riprova tra poco.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setError(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) {
      throw new Error("Supabase non è configurato.");
    }

    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Impossibile uscire dall’account. Riprova.");
    }
  }, []);

  const value = useMemo(
    () => ({
      error,
      isConfigured: isSupabaseConfigured,
      isLoading,
      session,
      signIn,
      signOut,
      user: session?.user ?? null,
    }),
    [error, isLoading, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
