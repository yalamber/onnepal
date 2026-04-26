'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, Clock, Phone, Mail, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { JOB_TYPES } from '@/lib/job-categories';
import { CommentSection } from '@/components/comment-section';

interface Job {
  id: string; userId: string; title: string; company: string; description: string | null; category: string;
  type: string; location: string | null; isRemote: boolean; salary: string | null;
  experience: string | null; applyUrl: string | null; contactEmail: string | null;
  contactPhone: string | null; status: string; createdAt: string; userName: string | null;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null)
      .then((d: { user?: { id: string; isAdmin?: boolean } } | null) => {
        if (d?.user) { setCurrentUserId(d.user.id); if (d.user.isAdmin) setUserIsAdmin(true); }
      });
  }, []);

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Job } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  const isOwner = currentUserId && item && (item.userId === currentUserId || userIsAdmin);
  const deleteItem = async () => {
    if (!confirm('Delete this job posting?')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    router.push('/jobs');
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-sm text-gray-500 mb-4">Job not found</p><Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-950">Back to Jobs</Link></div>;

  const typeLabel = JOB_TYPES.find(t => t.value === item.type)?.label || item.type;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Jobs</Link>

        {/* Top: job header + apply sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
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
                  {isOwner && (
                    <button onClick={deleteItem} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

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

            <p className="text-xs text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {item.category}</p>

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
                <a href={`tel:${item.contactPhone}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-md text-xs border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
                  <Phone className="h-4 w-4" /> {item.contactPhone}
                </a>
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
