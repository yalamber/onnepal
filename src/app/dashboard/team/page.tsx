'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, Users, X, User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  imageKey: string | null;
}

export default function TeamPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: '' });

  const fetchMembers = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/team?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { members?: TeamMember[] } = await res.json();
      setMembers(data.members || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, [business]);

  const addMember = async () => {
    if (!form.name.trim() || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/team?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: '', role: '' });
        setShowForm(false);
        await fetchMembers();
      }
    } finally { setAdding(false); }
  };

  const deleteMember = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/team/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setMembers(members.filter((m) => m.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="team" label="Team" businessId={business.id} enabledModules={business.enabledModules} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">Introduce your team members</p>
        </div>
        {!showForm && members.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add member
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New team member</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Role <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Manager, Chef, Designer..." />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={addMember} disabled={adding || !form.name.trim()} size="sm" className="bg-gray-950 text-white hover:bg-gray-800 cursor-pointer">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add member'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {members.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No team members yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your team to show who&apos;s behind the business</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add your first member
          </Button>
        </div>
      ) : members.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-500">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{member.name}</p>
                {member.role && (
                  <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMember(member.id)}
                className="text-gray-300 hover:text-red-500 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
