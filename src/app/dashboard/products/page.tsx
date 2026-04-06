'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, Package, X } from 'lucide-react';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/business/products');
      if (res.status === 401) { router.push('/login'); return; }
      const data: { products?: Product[] } = await res.json();
      setProducts(data.products || []);
    } catch {} finally { setLoading(false); }
  };

  const addProduct = async () => {
    if (!form.name.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/business/products', {
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
    await fetch(`/api/business/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Add button / form */}
      {showForm ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New product</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <Label className="text-xs">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description <span className="text-gray-400 font-normal">optional</span></Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Price <span className="text-gray-400 font-normal">optional</span></Label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Rs. 500" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Category <span className="text-gray-400 font-normal">optional</span></Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Food, Clothing..." className="mt-1" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={addProduct} disabled={adding || !form.name.trim()} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Product'}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      )}

      {/* List */}
      <div className="space-y-1.5">
        {products.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No products yet</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-3.5 bg-white rounded-lg border border-gray-200">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="font-medium text-sm text-gray-900">{product.name}</p>
                  {product.price && <span className="text-xs font-semibold text-indigo-600">{product.price}</span>}
                </div>
                {product.description && <p className="text-xs text-gray-400 truncate mt-0.5">{product.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="text-gray-400 hover:text-red-500 h-8 w-8">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
