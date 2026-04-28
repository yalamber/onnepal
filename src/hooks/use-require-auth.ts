'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireAuth(): { ready: boolean } {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        setReady(true);
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  return { ready };
}
