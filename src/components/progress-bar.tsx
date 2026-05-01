'use client';

import { ProgressProvider } from '@bprogress/next/app';

export function NavigationProgress({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="2px"
      color="#0891b2"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
