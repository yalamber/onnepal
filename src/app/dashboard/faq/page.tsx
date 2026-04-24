'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, HelpCircle, X } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '' });

  const fetchFaqs = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/faq?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { faqs?: FAQ[] } = await res.json();
      setFaqs(data.faqs || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchFaqs(); }, [business]);

  const addFaq = async () => {
    if (!form.question.trim() || !form.answer.trim() || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/faq?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ question: '', answer: '' });
        setShowForm(false);
        await fetchFaqs();
      }
    } finally { setAdding(false); }
  };

  const deleteFaq = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/faq/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setFaqs(faqs.filter((f) => f.id !== id));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">FAQ</h2>
          <p className="text-sm text-gray-500 mt-0.5">Answer common questions from your customers</p>
        </div>
        {!showForm && faqs.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add question
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New FAQ</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Question</label>
            <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What do customers often ask?" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Answer</label>
            <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Provide a clear answer" rows={3} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={addFaq} disabled={adding || !form.question.trim() || !form.answer.trim()} size="sm" className="bg-gray-950 text-white hover:bg-gray-800 cursor-pointer">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add FAQ'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {faqs.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No FAQs yet</p>
          <p className="text-xs text-gray-400 mt-1">Add frequently asked questions to help your customers</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add your first question
          </Button>
        </div>
      ) : faqs.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {faqs.map((faq) => (
            <div key={faq.id} className="px-4 py-4 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{faq.question}</p>
                  <p className="text-sm text-gray-500 mt-1.5">{faq.answer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFaq(faq.id)}
                  className="text-gray-300 hover:text-red-500 h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
