'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { NOTIFICATION_LABELS, type NotificationType } from '@/lib/db/queries/notifications';

type PrefMap = Partial<Record<NotificationType, boolean>>;

export function NotificationPreferencesPane() {
  const [prefs, setPrefs] = useState<PrefMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<NotificationType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/notifications/preferences')
      .then((r) => r.ok ? r.json() : null)
      .then((d: { preferences?: PrefMap } | null) => {
        if (!cancelled && d?.preferences) setPrefs(d.preferences);
      })
      .catch(() => { if (!cancelled) setError('Could not load preferences'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggle = async (type: NotificationType) => {
    const next = !(prefs[type] ?? true);
    setPrefs((p) => ({ ...p, [type]: next }));
    setSaving(type);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, inApp: next }),
      });
      if (!res.ok) throw new Error('Save failed');
    } catch {
      // Revert on failure
      setPrefs((p) => ({ ...p, [type]: !next }));
      setError('Could not save. Try again.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-400)]" />
      </div>
    );
  }

  const types = Object.keys(prefs) as NotificationType[];

  return (
    <div className="space-y-3 max-w-md">
      {types.length === 0 ? (
        <p className="text-sm text-[var(--ink-500)]">No preferences available.</p>
      ) : (
        types.map((type) => {
          const enabled = prefs[type] ?? true;
          const isSaving = saving === type;
          return (
            <label
              key={type}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-[var(--ink-200)] cursor-pointer hover:border-[var(--ink-900)]/40 transition-colors"
            >
              <span className="text-sm text-[var(--ink-900)]">{NOTIFICATION_LABELS[type]}</span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                disabled={isSaving}
                onClick={() => toggle(type)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                  enabled ? 'bg-[var(--accent)]' : 'bg-[var(--ink-200)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
                  } translate-y-0.5`}
                />
              </button>
            </label>
          );
        })
      )}
      {error && <p className="text-sm text-[var(--crimson-700)]">{error}</p>}
      <p className="text-xs text-[var(--ink-500)]">
        These control in-app notifications (the bell icon and the /notifications page).
      </p>
    </div>
  );
}
