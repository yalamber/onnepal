'use client';

import { Loader2 } from 'lucide-react';

interface SaveCancelProps {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function SaveCancelButtons({ saving, onSave, onCancel }: SaveCancelProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="h-9 rounded-lg border border-gray-200 px-4 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex h-9 items-center gap-2 rounded-lg bg-gray-950 px-4 text-sm text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save
      </button>
    </div>
  );
}

interface SubmitButtonProps {
  submitting: boolean;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function SubmitButton({ submitting, label, disabled, onClick }: SubmitButtonProps) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={submitting || disabled}
      className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gray-950 text-sm text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
    >
      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}
