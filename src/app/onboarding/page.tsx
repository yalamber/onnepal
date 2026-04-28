'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/create-business'); }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
    </div>
  );
}
