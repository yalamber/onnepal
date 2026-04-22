'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/create-business'); }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
    </div>
  );
}
