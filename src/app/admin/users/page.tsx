'use client';

import { useEffect, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return 'just now';
}

export default function AdminUsers() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json() as { users: User[] };
        setItems(data.users || []);
      } catch {} finally { setLoading(false); }
    };
    fetchItems();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Users</h1>
        <p className="mt-1 text-gray-400">{items.length} registered users.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">No users yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((u) => (
            <div key={u.id} className="py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-950">{u.displayName || u.email}</p>
                  {u.isAdmin && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-950 text-white">
                      <Shield className="h-2.5 w-2.5" /> Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                  <span>{u.email}</span>
                  {u.phone && <span>{u.phone}</span>}
                  <span>Joined {timeAgo(u.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
