'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setAdminCheckDone(true);
        setLoading(false);
      }
    });
    const {
      data: { subscription },
    } =     supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setAdminCheckDone(true);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setAdminCheckDone(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void supabase
      .from('admin_users')
      .select('email')
      .ilike('email', user.email.trim())
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setIsAdmin(!!data);
          setAdminCheckDone(true);
          setLoading(false);
        }
      })
      .then(
        () => {},
        () => {
          if (!cancelled) {
            setIsAdmin(false);
            setAdminCheckDone(true);
            setLoading(false);
          }
        }
      );
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading: loading || !adminCheckDone, isAdmin, signOut };
}
