'use client';

// Page-level error boundary. The interesting bit isn't the UI — it's the
// `useEffect` that re-logs the error from the *client* side, since by the
// time control reaches here the server has already redacted the RSC message.
// We log the digest (which IS preserved across the redaction) so you can
// correlate it against the server-side log line that has the real stack.

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the digest in the browser console so the user can copy it
    // into Workers Logs search.
    // eslint-disable-next-line no-console
    console.error('[error.tsx]', {
      digest: error.digest,
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <p className="t-eyebrow justify-center mb-4"><span className="dot" /> something broke</p>
        <h1 className="t-display" style={{ fontSize: 40 }}>
          A page failed to render.
        </h1>
        <p className="text-[var(--ink-500)] mt-3">
          We&rsquo;ve been notified. Try again, or head back home.
        </p>
        {error.digest && (
          <p className="t-meta mt-4">Error ref: <code>{error.digest}</code></p>
        )}
        <div className="flex gap-2 justify-center mt-6">
          <button onClick={reset} className="btn btn-ghost">Try again</button>
          <a href="/" className="btn btn-primary">Home</a>
        </div>
      </div>
    </main>
  );
}
