'use client';

import { useState } from 'react';
import { Mail, Loader2, Check, X } from 'lucide-react';

interface MessageButtonProps {
  recipientId: string;
  listingType: string;
  listingId: string;
  listingTitle: string;
}

export function MessageButton({ recipientId, listingType, listingId, listingTitle }: MessageButtonProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (!content.trim()) return;
    setSending(true); setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, listingType, listingId, listingTitle, content: content.trim() }),
      });
      if (res.status === 401) { setError('Please log in to send messages'); return; }
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); return; }
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setContent(''); }, 2000);
    } catch { setError('Something went wrong'); } finally { setSending(false); }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" /> Message sent!
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-gray-950 hover:bg-gray-800 text-white text-xs font-medium transition-colors cursor-pointer">
        <Mail className="h-3.5 w-3.5" /> Send message
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600">Send a message</p>
        <button onClick={() => { setOpen(false); setContent(''); setError(''); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="Hi, I'm interested in this..."
        rows={3} autoFocus
        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button onClick={send} disabled={sending || !content.trim()}
        className="w-full h-8 rounded-md bg-gray-950 hover:bg-gray-800 text-white text-xs font-medium disabled:opacity-30 cursor-pointer transition-colors">
        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Send'}
      </button>
    </div>
  );
}
