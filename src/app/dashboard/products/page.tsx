'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Package, X, Tag, Upload, Edit2, Check } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  category: string | null;
  isAvailable: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/products?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json() as { products?: Product[] };
      setProducts(data.products || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [business]);

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
      const body = {
        name: form.name,
        description: form.description || null,
        price: form.price || null,
        category: form.category || null,
        imageUrl: form.imageUrl || null,
      };
      if (editingId) {
        await fetch(`/api/business/products/${editingId}?businessId=${business.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/business/products?businessId=${business.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      setForm({ name: '', description: '', price: '', category: '', imageUrl: '' });
      setShowForm(false);
      setEditingId(null);
      await fetchProducts();
    } finally { setSaving(false); }
  };

  const startEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      imageUrl: product.imageUrl || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const toggleAvailability = async (product: Product) => {
    if (!business) return;
    await fetch(`/api/business/products/${product.id}?businessId=${business.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !product.isAvailable }),
    });
    setProducts(products.map(p => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/products/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="products" label="Products" businessId={business.id} enabledModules={business.enabledModules} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Products & Services</h2>
          <p className="text-sm text-gray-500 mt-0.5">Showcase what your business offers</p>
        </div>
        {!showForm && products.length > 0 && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', description: '', price: '', category: '', imageUrl: '' }); }}
            className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add product
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{editingId ? 'Edit product' : 'New product'}</p>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Price</label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Rs. 500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category</label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Electronics, Clothing, Food..." />
            {categories.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
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
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." rows={2} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Photo</label>
            {form.imageUrl ? (
              <div className="relative inline-block group">
                <img src={imageUrl(form.imageUrl) || ''} alt="" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
                <button onClick={() => setForm({ ...form, imageUrl: '' })}
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
                    if (key) setForm({ ...form, imageUrl: key });
                  }} />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving || !form.name.trim()}
              className="h-9 px-4 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </div>
      )}

      {products.length === 0 && !showForm ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No products yet</p>
          <p className="text-xs text-gray-400 mt-1">Add products and services to your page</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
            <Plus className="h-4 w-4 inline mr-1" /> Add first product
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {products.map((product) => (
            <div key={product.id} className={`border border-gray-100 rounded-lg overflow-hidden group hover:border-gray-200 transition-colors ${!product.isAvailable ? 'opacity-50' : ''}`}>
              {product.imageUrl && imageUrl(product.imageUrl) ? (
                <img src={imageUrl(product.imageUrl)!} alt={product.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-24 bg-gray-50 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-200" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-sm text-gray-950 ${!product.isAvailable ? 'line-through' : ''}`}>{product.name}</h3>
                    {product.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleAvailability(product)} title={product.isAvailable ? 'Mark unavailable' : 'Mark available'}
                      className={`p-1.5 rounded cursor-pointer transition-colors ${product.isAvailable ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => startEdit(product)} className="p-1.5 text-gray-400 hover:text-gray-950 cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {product.price && (
                    <span className="text-sm font-semibold text-gray-950">{product.price}</span>
                  )}
                  {product.category && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      <Tag className="h-2.5 w-2.5" /> {product.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
