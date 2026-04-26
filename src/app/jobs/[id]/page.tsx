'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, Clock, Phone, Mail, ExternalLink, Loader2 } from 'lucide-react';
import { JOB_TYPES } from '@/lib/job-categories';

interface Job {
  id: string; title: string; company: string; description: string | null; category: string;
  type: string; location: string | null; isRemote: boolean; salary: string | null;
  experience: string | null; applyUrl: string | null; contactEmail: string | null;
  contactPhone: string | null; status: string; createdAt: string; userName: string | null;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.ok ? r.json() : null)
      .then((d: { item: Job } | null) => { if (d) setItem(d.item); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  if (!item) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-sm text-gray-500 mb-4">Job not found</p><Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-950">Back to Jobs</Link></div>;

  const typeLabel = JOB_TYPES.find(t => t.value === item.type)?.label || item.type;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Jobs</Link>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 text-lg font-bold">
            {item.company.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950">{item.title}</h1>
            <p className="text-gray-600 mt-0.5">{item.company}</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" /> {typeLabel}</span>
          {item.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {item.location}</span>}
          {item.isRemote && <span className="text-green-600 font-medium">Remote</span>}
          {item.experience && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" /> {item.experience}</span>}
        </div>

        {item.salary && (
          <div className="mt-4 inline-flex px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-semibold text-gray-950">
            {item.salary}
          </div>
        )}

        {item.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-950 mb-3">How to apply</p>
          <div className="flex flex-wrap gap-3">
            {item.applyUrl && <a href={item.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-gray-950 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"><ExternalLink className="h-4 w-4" /> Apply now</a>}
            {item.contactEmail && <a href={`mailto:${item.contactEmail}`} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Mail className="h-4 w-4" /> {item.contactEmail}</a>}
            {item.contactPhone && <a href={`tel:${item.contactPhone}`} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Phone className="h-4 w-4" /> {item.contactPhone}</a>}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {item.category}</p>
      </div>
    </div>
  );
}
