'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUser() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    async function load(u) {
      if (!u) { setUser(null); setProfile(null); return; }
      setUser(u);
      const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single();
      setProfile(data ?? null);
    }

    supabase.auth.getUser().then(({ data: { user } }) => load(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    role: profile?.role ?? null,
    loading: user === undefined,
  };
}
