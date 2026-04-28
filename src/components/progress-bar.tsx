'use client';

import { Progress } from '@bprogress/next';

export function NavigationProgress() {
  return (
    <Progress
      height="2px"
      color="#0a0a0a"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
