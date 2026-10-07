import type { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Profile, supabase } from '@/services/supabase';

/**
 * Local design review only: browse the member screens without signing in.
 * Requires the dev server (`__DEV__`) and EXPO_PUBLIC_UI_PREVIEW=1; never active in builds.
 */
export const UI_PREVIEW = __DEV__ && process.env.EXPO_PUBLIC_UI_PREVIEW === '1';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  /** True until the stored session (if any) has been restored. */
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Supabase error → message a person can act on. */
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'El correo o la contraseña no coinciden.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  if (m.includes('password')) return 'La contraseña debe tener al menos 8 caracteres.';
  if (m.includes('email')) return 'Revisa que el correo esté bien escrito.';
  if (m.includes('network') || m.includes('fetch')) return 'No hay conexión. Revisa tu internet e intenta de nuevo.';
  return 'No pudimos completar la acción. Intenta de nuevo.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => setProfile((data as Profile) ?? null));
  }, [userId]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } });
    return error ? friendly(error.message) : null;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? friendly(error.message) : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // A profile only counts if it belongs to the account that is signed in right now.
  const current = profile && profile.id === userId ? profile : null;
  const value = useMemo(() => ({ session, profile: current, loading, signUp, signIn, signOut }), [session, current, loading, signUp, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
