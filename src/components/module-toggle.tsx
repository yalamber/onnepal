'use client';

import { useState } from 'react';

interface ModuleToggleProps {
  moduleKey: string;
  label: string;
  businessId: string;
  enabledModules: string | null;
  onToggle?: (enabled: boolean) => void;
}

export function ModuleToggle({ moduleKey, label, businessId, enabledModules, onToggle }: ModuleToggleProps) {
  const modules: string[] = (() => { try { return JSON.parse(enabledModules || '[]'); } catch { return []; } })();
  const [enabled, setEnabled] = useState(modules.includes(moduleKey));
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    setSaving(true);
    const next = enabled ? modules.filter(m => m !== moduleKey) : [...modules, moduleKey];
    try {
      await fetch(`/api/business/profile?businessId=${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledModules: JSON.stringify(next) }),
      });
      setEnabled(!enabled);
      onToggle?.(!enabled);
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg mb-6">
      <div>
        <p className="text-sm text-gray-950">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          {label} section is <span className="font-medium">{enabled ? 'visible' : 'hidden'}</span> on your page
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        className={`px-3 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
          enabled ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-950 text-white hover:bg-gray-800'
        }`}
      >
        {saving ? '...' : enabled ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
