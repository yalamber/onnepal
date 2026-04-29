'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ShoppingBag, Plus, Minus, X, MessageCircle } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) { setItems(prev => prev.filter(i => i.id !== id)); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

function parsePrice(price: string | null): number | null {
  if (!price) return null;
  const match = price.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function formatTotal(items: CartItem[]): string {
  let total = 0;
  let allParseable = true;
  for (const item of items) {
    const p = parsePrice(item.price);
    if (p !== null) total += p * item.quantity;
    else if (item.price) allParseable = false;
  }
  if (total === 0 && !allParseable) return '';
  return `Rs. ${total.toLocaleString()}`;
}

export function AddToCartButton({ id, name, price }: { id: string; name: string; price: string | null }) {
  const { addItem, items } = useCart();
  const inCart = items.find(i => i.id === id);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem({ id, name, price }); }}
      className="px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
    >
      {inCart ? `Added (${inCart.quantity})` : 'Add'}
    </button>
  );
}

export function CartFloatingButton({ onClick }: { onClick: () => void }) {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 bg-gray-950 hover:bg-gray-800 text-white rounded-full flex items-center justify-center z-50 transition-colors cursor-pointer"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {totalItems}
      </span>
    </button>
  );
}

export function CartDrawer({ open, onClose, businessName, whatsappNumber }: {
  open: boolean;
  onClose: () => void;
  businessName: string;
  whatsappNumber: string | null;
}) {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const total = formatTotal(items);

  const buildWhatsAppMessage = () => {
    let msg = `Hi ${businessName}, I'd like to order:\n\n`;
    items.forEach(item => {
      msg += `• ${item.name} x${item.quantity}`;
      if (item.price) msg += ` — ${item.price}`;
      msg += '\n';
    });
    if (total) msg += `\nTotal: ${total}`;
    return encodeURIComponent(msg);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-950">Your order ({items.length})</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-950 cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Your cart is empty</p>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-950 truncate">{item.name}</p>
                    {item.price && <p className="text-xs text-gray-500">{item.price}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                      <Plus className="h-3 w-3" />
                    </button>
                    <button onClick={() => removeItem(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            {total && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estimated total</span>
                <span className="text-base font-semibold text-gray-950">{total}</span>
              </div>
            )}
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-11 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Order via WhatsApp
              </a>
            ) : (
              <p className="text-xs text-gray-400 text-center">This business hasn't set up WhatsApp ordering yet.</p>
            )}
            <button onClick={clearCart} className="w-full text-xs text-gray-400 hover:text-gray-950 cursor-pointer py-1">
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
