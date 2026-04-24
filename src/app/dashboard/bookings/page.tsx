'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Trash2, Check, X as XIcon, Clock, Phone, Mail } from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  date: string;
  time: string | null;
  service: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50',
  confirmed: 'text-green-700 bg-green-50',
  cancelled: 'text-gray-500 bg-gray-100',
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: Check,
  cancelled: XIcon,
};

export default function BookingsPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/bookings?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { bookings?: Booking[] } = await res.json();
      setBookings(data.bookings || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [business]);

  const updateStatus = async (id: string, status: string) => {
    if (!business) return;
    const res = await fetch(`/api/business/bookings/${id}?businessId=${business.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b));
    }
  };

  const deleteBooking = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/bookings/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setBookings(bookings.filter((b) => b.id !== id));
  };

  const formatDate = (dateStr: string) => {
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
      {business && <ModuleToggle moduleKey="bookings" label="Bookings" businessId={business.id} enabledModules={business.enabledModules} />}
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Bookings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage appointment and booking requests</p>
      </div>

      {/* List */}
      {bookings.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-teal-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No bookings yet</p>
          <p className="text-xs text-gray-400 mt-1">Bookings will appear here when customers make requests</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {bookings.map((booking) => {
            const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
            const StatusIcon = STATUS_ICONS[booking.status] || Clock;
            return (
              <div key={booking.id} className="px-4 py-4 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-900">{booking.customerName}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${statusStyle}`}>
                        <StatusIcon className="h-2.5 w-2.5" /> {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" /> {formatDate(booking.date)}
                      </span>
                      {booking.time && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" /> {booking.time}
                        </span>
                      )}
                      {booking.service && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{booking.service}</span>
                      )}
                    </div>
                    {(booking.customerPhone || booking.customerEmail) && (
                      <div className="flex items-center gap-3 mt-1.5">
                        {booking.customerPhone && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="h-3 w-3" /> {booking.customerPhone}
                          </span>
                        )}
                        {booking.customerEmail && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="h-3 w-3" /> {booking.customerEmail}
                          </span>
                        )}
                      </div>
                    )}
                    {booking.message && (
                      <p className="text-xs text-gray-400 mt-1.5">{booking.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {booking.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="text-gray-300 hover:text-green-600 h-8 w-8 cursor-pointer"
                        title="Confirm"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="text-gray-300 hover:text-amber-600 h-8 w-8 cursor-pointer"
                        title="Cancel"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBooking(booking.id)}
                      className="text-gray-300 hover:text-red-500 h-8 w-8 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
