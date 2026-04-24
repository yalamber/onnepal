'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Package, X, Tag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  category: string | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });

  const fetchProducts = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/products?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { products?: Product[] } = await res.json();
      setProducts(data.products || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [business]);

  const addProduct = async () => {
    if (!form.name.trim() || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/products?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: '', description: '', price: '', category: '' });
        setShowForm(false);
        await fetchProducts();
      }
    } finally { setAdding(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/products/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="products" label="Products" businessId={business.id} enabledModules={business.enabledModules} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Products & Services</h2>
          <p className="text-sm text-gray-500 mt-0.5">Showcase what your business offers</p>
        </div>
        {!showForm && products.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add product
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New product</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
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
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Rs. 500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Category <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Food, Clothing..." />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={addProduct} disabled={adding || !form.name.trim()} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add product'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {products.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No products yet</p>
          <p className="text-xs text-gray-400 mt-1">Add products and services to your page</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add your first product
          </Button>
        </div>
      ) : products.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden group hover:shadow-md transition-shadow">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-200" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProduct(product.id)}
                    className="text-gray-300 hover:text-red-500 h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {product.price && (
                    <span className="text-sm font-bold text-indigo-600">{product.price}</span>
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
