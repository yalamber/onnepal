'use client';

import { useState, useEffect, useCallback } from 'react';

interface CurrentUser {
  userId: string | null;
  isAdmin: boolean;
  loading: boolean;
  isOwner: (ownerId: string) => boolean;
}

export function useCurrentUser(): CurrentUser {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: { user?: { id: string; isAdmin?: boolean } } | null) => {
        if (data?.user) {
          setUserId(data.user.id);
          setIsAdmin(!!data.user.isAdmin);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isOwner = useCallback(
    (ownerId: string) => {
      if (!userId) return false;
      return userId === ownerId || isAdmin;
    },
    [userId, isAdmin]
  );

  return { userId, isAdmin, loading, isOwner };
}
