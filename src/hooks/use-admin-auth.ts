'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const ADMIN_VERIFIED_KEY = 'hbf-admin-verified';

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        if (typeof window !== 'undefined') sessionStorage.removeItem(ADMIN_VERIFIED_KEY);
        setAdminCheckDone(true);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.email) {
      return;
    }
    if (typeof window !== 'undefined' && sessionStorage.getItem(ADMIN_VERIFIED_KEY)) {
      setIsAdmin(true);
      setAdminCheckDone(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token;
      if (!token || cancelled) {
        if (!cancelled) {
          setAdminCheckDone(true);
          setLoading(false);
        }
        return;
      }
      fetch('/api/admin/check', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((body) => {
          if (!cancelled) {
            const ok = body?.isAdmin === true;
            setIsAdmin(ok);
            if (ok && typeof window !== 'undefined') {
              sessionStorage.setItem(ADMIN_VERIFIED_KEY, '1');
            }
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
    });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const signOut = async () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(ADMIN_VERIFIED_KEY);
    await supabase.auth.signOut();
  };

  return { user, loading: loading || !adminCheckDone, isAdmin, signOut };
}
