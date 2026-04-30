'use client';

import { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Code, Link2, Eye, Pencil } from 'lucide-react';
import { SafeMarkdown } from './safe-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 5 }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaId = 'md-editor';

  const insert = (before: string, after = '', placeholder_text = '') => {
    const el = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const text = selected || placeholder_text;
    const newValue = value.substring(0, start) + before + text + after + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      el.focus();
      const pos = start + before.length;
      el.setSelectionRange(pos, pos + text.length);
    }, 0);
  };

  const toolbar = [
    { icon: Bold, label: 'Bold', action: () => insert('**', '**', 'bold') },
    { icon: Italic, label: 'Italic', action: () => insert('*', '*', 'italic') },
    { icon: List, label: 'Bullet list', action: () => insert('\n- ', '', 'item') },
    { icon: ListOrdered, label: 'Numbered list', action: () => insert('\n1. ', '', 'item') },
    { icon: Quote, label: 'Quote', action: () => insert('\n> ', '', 'quote') },
    { icon: Code, label: 'Code', action: () => insert('`', '`', 'code') },
    { icon: Link2, label: 'Link', action: () => insert('[', '](url)', 'text') },
  ];

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden focus-within:border-gray-400 transition-colors">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-0.5">
          {toolbar.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
            preview ? 'bg-gray-950 text-white' : 'text-gray-400 hover:text-gray-950 hover:bg-gray-100'
          }`}
        >
          {preview ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div className="px-3 py-3 min-h-[120px]">
          {value.trim() ? (
            <SafeMarkdown content={value} />
          ) : (
            <p className="text-sm text-gray-300 italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          id={textareaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none resize-none"
        />
      )}
    </div>
  );
}
