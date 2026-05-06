'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Mail, Send, ArrowLeft, ChevronRight } from 'lucide-react';
import { useActiveBusiness } from '../layout';
import { timeAgo } from '@/lib/time-ago';

interface Conversation {
  otherUserId: string;
  otherUserName: string | null;
  listingType: string;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName: string | null;
}

export default function MessagesPage() {
  const { user } = useActiveBusiness();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [thread, setThread] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.ok ? r.json() : null)
      .then((d: { conversations: Conversation[] } | null) => {
        if (d) setConversations(d.conversations || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Deep-link: when arriving with ?otherUserId=&listingType=&listingId=, auto-
  // open that thread once the conversations list loads. Used by the messages
  // bell popover so clicking a thread there lands you straight in the chat.
  useEffect(() => {
    if (loading) return;
    const otherUserId = searchParams?.get('otherUserId');
    const listingType = searchParams?.get('listingType');
    const listingId = searchParams?.get('listingId');
    if (!otherUserId || !listingType || !listingId) return;
    if (activeConv && activeConv.otherUserId === otherUserId && activeConv.listingId === listingId) return;
    const match = conversations.find(
      (c) => c.otherUserId === otherUserId && c.listingType === listingType && c.listingId === listingId,
    );
    if (match) openThread(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, conversations, searchParams]);

  const openThread = async (conv: Conversation) => {
    setActiveConv(conv);
    const res = await fetch(`/api/messages?otherUserId=${conv.otherUserId}&listingType=${conv.listingType}&listingId=${conv.listingId}`);
    if (res.ok) {
      const d = await res.json() as { messages: Message[] };
      setThread(d.messages || []);
    }
    setConversations(prev => prev.map(c =>
      c.otherUserId === conv.otherUserId && c.listingId === conv.listingId ? { ...c, unread: 0 } : c
    ));
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: activeConv.otherUserId,
          listingType: activeConv.listingType,
          listingId: activeConv.listingId,
          listingTitle: activeConv.listingTitle,
          content: reply.trim(),
        }),
      });
      if (res.ok) {
        setReply('');
        await openThread(activeConv);
      }
    } finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  if (activeConv) {
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveConv(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 cursor-pointer transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <p className="text-sm font-semibold text-gray-950">{activeConv.otherUserName || 'User'}</p>
          <p className="text-xs text-gray-400">Re: {activeConv.listingTitle}</p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {thread.map((m) => {
            const isMe = m.senderId === user?.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  isMe ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  <p>{m.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>{timeAgo(m.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <input type="text" value={reply} onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
            placeholder="Type a reply..."
            className="flex-1 h-9 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400" />
          <button onClick={sendReply} disabled={sending || !reply.trim()}
            className="h-9 px-3 bg-gray-950 text-white rounded-md disabled:opacity-30 cursor-pointer hover:bg-gray-800">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500 mt-0.5">Your conversations with other users</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Messages from listings will appear here</p>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
          {conversations.map((conv) => (
            <button key={`${conv.otherUserId}:${conv.listingId}`}
              onClick={() => openThread(conv)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-400">
                {(conv.otherUserName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-950 truncate">{conv.otherUserName || 'User'}</p>
                  {conv.unread > 0 && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 truncate">{conv.listingTitle}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-gray-400">{timeAgo(conv.lastAt)}</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
