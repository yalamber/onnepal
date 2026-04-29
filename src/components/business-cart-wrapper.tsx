'use client';

import { useState } from 'react';
import { CartProvider, CartFloatingButton, CartDrawer } from './business-cart';

export function BusinessCartWrapper({ children, businessName, whatsappNumber }: {
  children: React.ReactNode;
  businessName: string;
  whatsappNumber: string | null;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <CartProvider>
      {children}
      <CartFloatingButton onClick={() => setDrawerOpen(true)} />
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        businessName={businessName}
        whatsappNumber={whatsappNumber}
      />
    </CartProvider>
  );
}
