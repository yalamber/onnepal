'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, UtensilsCrossed, X, Upload, Edit2, Check } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';
import { ModuleToggle } from '@/components/module-toggle';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  category: string | null;
  imageKey: string | null;
  isAvailable: boolean;
}

export default function MenuPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', imageKey: '' });
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/menu?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json() as { menuItems?: MenuItem[] };
      setItems(data.menuItems || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [business]);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) return null;
      const data = await res.json() as { key: string };
      return data.key;
    } catch { return null; }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !business) return;
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/business/menu/${editingId}?businessId=${business.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            price: form.price || null,
            category: form.category || null,
            imageKey: form.imageKey || null,
          }),
        });
      } else {
        await fetch(`/api/business/menu?businessId=${business.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            price: form.price || null,
            category: form.category || null,
            imageKey: form.imageKey || null,
          }),
        });
      }
      setForm({ name: '', description: '', price: '', category: '', imageKey: '' });
      setShowForm(false);
      setEditingId(null);
      await fetchItems();
    } finally { setSaving(false); }
  };

  const startEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
      imageKey: item.imageKey || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const toggleAvailability = async (item: MenuItem) => {
    if (!business) return;
    await fetch(`/api/business/menu/${item.id}?businessId=${business.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    setItems(items.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
  };

  const deleteItem = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/menu/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))] as string[];
  const uncategorized = items.filter(i => !i.category);

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="menu" label="Menu" businessId={business.id} enabledModules={business.enabledModules} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your restaurant menu and price list</p>
        </div>
        {!showForm && items.length > 0 && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', description: '', price: '', category: '', imageKey: '' }); }}
            className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add item
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{editingId ? 'Edit item' : 'New menu item'}</p>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Chicken Momo" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Price</label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Rs. 200" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category</label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Appetizers, Main Course, Drinks..." />
            {categories.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                    className={`px-2 py-0.5 text-xs rounded cursor-pointer transition-colors ${form.category === cat ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Steamed dumplings..." rows={2} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Photo</label>
            {form.imageKey ? (
              <div className="relative inline-block group">
                <img src={imageUrl(form.imageKey) || ''} alt="" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
                <button onClick={() => setForm({ ...form, imageKey: '' })}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-gray-950 hover:border-gray-400 cursor-pointer transition-colors">
                {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Choose photo</>}
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const key = await uploadImage(file);
                    if (key) setForm({ ...form, imageKey: key });
                  }} />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving || !form.name.trim()}
              className="h-9 px-4 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </div>
      )}

      {/* Menu items grouped by category */}
      {items.length === 0 && !showForm ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <UtensilsCrossed className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No menu items yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your menu items with prices and photos</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
            <Plus className="h-4 w-4 inline mr-1" /> Add first item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat}</h3>
              <div className="divide-y divide-gray-100">
                {items.filter(i => i.category === cat).map(item => (
                  <MenuItemRow key={item.id} item={item} onEdit={startEdit} onToggle={toggleAvailability} onDelete={deleteItem} />
                ))}
              </div>
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div>
              {categories.length > 0 && <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Other</h3>}
              <div className="divide-y divide-gray-100">
                {uncategorized.map(item => (
                  <MenuItemRow key={item.id} item={item} onEdit={startEdit} onToggle={toggleAvailability} onDelete={deleteItem} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItemRow({ item, onEdit, onToggle, onDelete }: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onToggle: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`flex items-center gap-4 py-3 group ${!item.isAvailable ? 'opacity-50' : ''}`}>
      {item.imageKey && imageUrl(item.imageKey) ? (
        <img src={imageUrl(item.imageKey)!} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="h-4 w-4 text-gray-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-950 ${!item.isAvailable ? 'line-through' : ''}`}>{item.name}</p>
        {item.description && <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>}
      </div>
      {item.price && <p className="text-sm font-semibold text-gray-950 flex-shrink-0">{item.price}</p>}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(item)} title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
          className={`p-1.5 rounded cursor-pointer transition-colors ${item.isAvailable ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-gray-950 cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
