'use client';

import { Edit2, Trash2, Check } from 'lucide-react';

interface OwnerActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onResolve?: () => void;
}

export function OwnerActions({ onEdit, onDelete, onResolve }: OwnerActionsProps) {
  if (!onEdit && !onDelete && !onResolve) return null;

  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}
      {onResolve && (
        <button
          onClick={onResolve}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
