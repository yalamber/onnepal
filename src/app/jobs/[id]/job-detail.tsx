'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Phone, Mail, ExternalLink, Loader2, User } from 'lucide-react';
import { JOB_TYPES } from '@/lib/job-categories';
import { CommentSection } from '@/components/comment-section';
import { useCurrentUser } from '@/hooks/use-current-user';
import { OwnerActions } from '@/components/owner-actions';
import { SaveCancelButtons } from '@/components/form-buttons';
import { ContactLinks } from '@/components/contact-links';

interface Job {
  id: string; userId: string; title: string; company: string; description: string | null; category: string;
  type: string; location: string | null; isRemote: boolean; salary: string | null;
  experience: string | null; applyUrl: string | null; contactEmail: string | null;
  contactPhone: string | null; status: string; createdAt: string; userName: string | null;
}

export default function JobDetailPage({ initialData }: { initialData?: Job | null }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Job | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const { isOwner } = useCurrentUser();

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Job } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', company: '', description: '', location: '', salary: '', experience: '', applyUrl: '', contactEmail: '', contactPhone: '' });

  const deleteItem = async () => {
    if (!confirm('Delete this job posting?')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Failed to delete'); return; }
    router.push('/jobs');
  };
  const startEdit = () => {
    if (!item) return;
    setEditForm({
      title: item.title, company: item.company, description: item.description || '',
      location: item.location || '', salary: item.salary || '', experience: item.experience || '',
      applyUrl: item.applyUrl || '', contactEmail: item.contactEmail || '', contactPhone: item.contactPhone || '',
    });
    setEditing(true);
  };
  const saveEdit = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title, company: editForm.company, description: editForm.description || null,
          location: editForm.location || null, salary: editForm.salary || null, experience: editForm.experience || null,
          applyUrl: editForm.applyUrl || null, contactEmail: editForm.contactEmail || null, contactPhone: editForm.contactPhone || null,
        }),
      });
      setEditing(false);
      const res = await fetch(`/api/jobs/${id}`);
      if (res.ok) { const d = await res.json() as { item: Job }; setItem(d.item); }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-sm text-gray-500 mb-4">Job not found</p><Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-950">Back to Jobs</Link></div>;

  const typeLabel = JOB_TYPES.find(t => t.value === item.type)?.label || item.type;
  const ownerOfItem = isOwner(item.userId);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Jobs</Link>

        {/* Top: job header + apply sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {editing ? (
              <div className="space-y-3">
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm font-semibold focus:outline-none focus:border-gray-400" />
                <input type="text" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Company" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    placeholder="Salary" className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Location" className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description" rows={4}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={editForm.applyUrl} onChange={(e) => setEditForm({ ...editForm, applyUrl: e.target.value })}
                    placeholder="Apply URL" className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                  <input type="email" value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    placeholder="Email" className="h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                <SaveCancelButtons saving={saving} onSave={saveEdit} onCancel={() => setEditing(false)} />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 text-base font-bold">
                  {item.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="text-xl font-bold text-gray-950">{item.title}</h1>
                      <p className="text-sm text-gray-600 mt-0.5">{item.company}</p>
                    </div>
                    {ownerOfItem && (
                      <OwnerActions onEdit={startEdit} onDelete={deleteItem} />
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-700">{typeLabel}</span>
              {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" /> {item.location}</span>}
              {item.isRemote && <span className="text-green-600 font-medium">Remote</span>}
              {item.experience && <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" /> {item.experience}</span>}
              {item.salary && <span className="font-semibold text-gray-950">{item.salary}</span>}
            </div>

            {item.description && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About this role</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            <p className="text-xs text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {item.category}{item.userName && <> · <Link href={`/user/${item.userId}`} className="hover:text-gray-950 transition-colors">{item.userName}</Link></>}</p>

            <CommentSection targetType="job" targetId={item.id} />
          </div>

          {/* Right sidebar: apply (sticky) */}
          <div>
            <div className="lg:sticky lg:top-6 space-y-3 border border-gray-200 rounded-lg p-5">
              <p className="text-sm font-semibold text-gray-950">Apply for this job</p>
              {item.applyUrl && (
                <a href={item.applyUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-md text-xs bg-gray-950 hover:bg-gray-800 text-white font-medium text-sm transition-colors">
                  <ExternalLink className="h-4 w-4" /> Apply now
                </a>
              )}
              {item.contactEmail && (
                <a href={`mailto:${item.contactEmail}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-md text-xs border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
                  <Mail className="h-4 w-4" /> {item.contactEmail}
                </a>
              )}
              {item.contactPhone && (
                <ContactLinks phone={item.contactPhone} />
              )}
              {!item.applyUrl && !item.contactEmail && !item.contactPhone && (
                <p className="text-sm text-gray-400">No application method provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
