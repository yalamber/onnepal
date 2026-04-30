'use client';

import { useState, useRef, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { toast } from 'sonner';

interface ReportButtonProps {
  targetType: string;
  targetId: string;
}

const REPORT_REASONS = [
  'Spam or scam',
  'Inappropriate content',
  'Wrong category',
  'Duplicate listing',
  'Other',
];

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const { userId } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleClick = () => {
    if (!userId) {
      toast.error('Please log in to report');
      return;
    }
    setOpen((prev) => !prev);
  };

  const submitReport = async (reason: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      if (res.ok) {
        toast.success('Report submitted');
      } else if (res.status === 409) {
        toast.error('You have already reported this item');
      } else {
        toast.error('Failed to submit report');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleClick}
        title="Report"
        className="p-1.5 rounded-md text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
      >
        <Flag className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-sm z-50 py-1">
          <p className="px-3 py-1.5 text-xs font-medium text-gray-400">Report reason</p>
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => submitReport(reason)}
              disabled={submitting}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
