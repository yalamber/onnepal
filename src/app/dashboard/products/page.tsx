'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Loader2, Package } from 'lucide-react';

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

  useEffect(() => {
    fetchProducts();
  }, []);

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-[1.375rem] font-bold tracking-[-0.025em] text-neutral-950 leading-[1.2]">Products</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-neutral-950 text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">New Product</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (optional)</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Rs. 500" />
              </div>
              <div>
                <Label>Category (optional)</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Food, Clothing..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={addProduct} disabled={adding || !form.name.trim()} className="bg-neutral-950 text-white hover:bg-neutral-800">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Product'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-400">No products yet. Add your first product.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-900">{product.name}</p>
                {product.description && <p className="text-xs text-neutral-400 truncate">{product.description}</p>}
                {product.price && <p className="text-sm font-semibold text-neutral-950 mt-1">{product.price}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="text-neutral-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
