'use client';

import { ProgressProvider } from '@bprogress/next/app';

export function NavigationProgress({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="2px"
      color="#0a0a0a"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
