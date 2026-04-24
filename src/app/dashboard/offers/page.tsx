'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Gift, X, Ticket, Calendar } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  discountText: string | null;
  code: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export default function OffersPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discountText: '', code: '', expiresAt: '' });

  const fetchOffers = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/offers?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { offers?: Offer[] } = await res.json();
      setOffers(data.offers || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOffers(); }, [business]);

  const addOffer = async () => {
    if (!form.title.trim() || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/offers?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (res.ok) {
        setForm({ title: '', description: '', discountText: '', code: '', expiresAt: '' });
        setShowForm(false);
        await fetchOffers();
      }
    } finally { setAdding(false); }
  };

  const deleteOffer = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/offers/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setOffers(offers.filter((o) => o.id !== id));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
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
      {business && <ModuleToggle moduleKey="offers" label="Offers" businessId={business.id} enabledModules={business.enabledModules} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Special Offers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create deals and promotions for your customers</p>
        </div>
        {!showForm && offers.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add offer
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New offer</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the offer details" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Discount text <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input value={form.discountText} onChange={(e) => setForm({ ...form, discountText: e.target.value })} placeholder="20% OFF" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Coupon code <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Expires on <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={addOffer} disabled={adding || !form.title.trim()} size="sm" className="bg-gray-950 text-white hover:bg-gray-800 cursor-pointer">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add offer'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {offers.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <Gift className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No offers yet</p>
          <p className="text-xs text-gray-400 mt-1">Create special deals to attract more customers</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add your first offer
          </Button>
        </div>
      ) : offers.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {offers.map((offer) => (
            <div key={offer.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-500">
                <Gift className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900">{offer.title}</p>
                  {offer.discountText && (
                    <span className="inline-flex text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      {offer.discountText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {offer.code && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                      <Ticket className="h-2.5 w-2.5" /> {offer.code}
                    </span>
                  )}
                  {offer.expiresAt && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar className="h-2.5 w-2.5" /> {formatDate(offer.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteOffer(offer.id)}
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
