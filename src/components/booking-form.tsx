'use client';

import { useState } from 'react';

interface BookingFormProps {
  businessId: string;
  primaryColor: string;
}

export function BookingForm({ businessId, primaryColor }: BookingFormProps) {
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', date: '', time: '', service: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.date) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/business/bookings?businessId=${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim() || null,
          customerEmail: form.customerEmail.trim() || null,
          date: form.date,
          time: form.time || null,
          service: form.service.trim() || null,
          message: form.message.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string } | null;
        setError(data?.error || 'Failed to submit');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-gray-100 rounded-lg p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-gray-950">Booking request sent!</p>
        <p className="text-sm text-gray-500 mt-1">We&apos;ll get back to you to confirm your appointment.</p>
      </div>
    );
  }

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your name *</label>
          <input type="text" required value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Full name" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone</label>
          <input type="tel" value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            placeholder="+977-..." className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email</label>
        <input type="email" value={form.customerEmail}
          onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
          placeholder="your@email.com" className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Preferred date *</label>
          <input type="date" required value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Preferred time</label>
          <input type="time" value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Service</label>
        <input type="text" value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          placeholder="What service are you booking?" className={inputClass} />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Message</label>
        <textarea value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Any additional details..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={submitting || !form.customerName.trim() || !form.date}
        className="h-10 px-6 text-white text-sm font-medium rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
        style={{ backgroundColor: primaryColor }}>
        {submitting ? 'Sending...' : 'Request booking'}
      </button>
    </form>
  );
}
