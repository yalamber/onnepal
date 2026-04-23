'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  location: string;
  contactPhone: string;
  contactWhatsapp: string;
}

interface FormErrors {
  title?: string;
  category?: string;
}

export default function NewClassifiedPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    contactPhone: '',
    contactWhatsapp: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        setAuthenticated(true);
      } catch {
        router.push('/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim() || form.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!form.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/classifieds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          price: form.price.trim() || null,
          category: form.category,
          location: form.location.trim() || null,
          contactPhone: form.contactPhone.trim() || null,
          contactWhatsapp: form.contactWhatsapp.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setServerError(data?.error || 'Failed to create listing. Please try again.');
        return;
      }

      const data = await res.json();
      const listingId = data.listing?.id || data.id;
      router.push(`/classifieds/post/${listingId}`);
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth || !authenticated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/classifieds"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classifieds
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Post a classified ad</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below to list your item or service.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="p-5 sm:p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Title <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., iPhone 15 Pro Max - Like New"
                maxLength={120}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1.5">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-gray-400 appearance-none cursor-pointer transition-colors"
              >
                <option value="">Select a category</option>
                {CLASSIFIED_CATEGORIES.map((parent) => (
                  <optgroup key={parent.slug} label={parent.name}>
                    {parent.subcategories.map((sub) => (
                      <option key={sub.slug} value={sub.name}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1.5">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your item or service in detail..."
                rows={5}
              />
            </div>

            {/* Price & Location */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Price <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="e.g., 150000"
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave empty for &quot;Contact for price&quot;</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Location <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., Kathmandu, Lalitpur"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Contact info heading */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact information</h3>
              <p className="text-xs text-gray-400">
                Provide at least one way for buyers to reach you.
              </p>
            </div>

            {/* Contact fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Phone number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="+977-98XXXXXXXX"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  type="tel"
                  value={form.contactWhatsapp}
                  onChange={(e) => updateField('contactWhatsapp', e.target.value)}
                  placeholder="+977-98XXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/classifieds')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gray-950 hover:bg-gray-800 text-white gap-1.5"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Post ad
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
