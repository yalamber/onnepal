'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, UtensilsCrossed, X, Tag } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  category: string | null;
  isAvailable: boolean;
}

export default function MenuPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });

  const fetchMenuItems = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/menu?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { menuItems?: MenuItem[] } = await res.json();
      setMenuItems(data.menuItems || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMenuItems(); }, [business]);

  const addMenuItem = async () => {
    if (!form.name.trim() || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/menu?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: '', description: '', price: '', category: '' });
        setShowForm(false);
        await fetchMenuItems();
      }
    } finally { setAdding(false); }
  };

  const deleteMenuItem = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/menu/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setMenuItems(menuItems.filter((m) => m.id !== id));
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
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your food and drink menu items</p>
        </div>
        {!showForm && menuItems.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add item
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New menu item</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Price <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Rs. 250" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Category <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Appetizer, Main, Drinks..." />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={addMenuItem} disabled={adding || !form.name.trim()} size="sm" className="bg-gray-950 text-white hover:bg-gray-800 cursor-pointer">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add item'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {menuItems.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="h-6 w-6 text-orange-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No menu items yet</p>
          <p className="text-xs text-gray-400 mt-1">Add items to display your menu on your page</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-gray-950 hover:bg-gray-800 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Add your first item
          </Button>
        </div>
      ) : menuItems.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {menuItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-500">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  {item.price && (
                    <span className="text-sm font-bold text-gray-700">{item.price}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.description && (
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  )}
                </div>
              </div>
              {item.category && (
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  <Tag className="h-2.5 w-2.5" /> {item.category}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMenuItem(item.id)}
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
