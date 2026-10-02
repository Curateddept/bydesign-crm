"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Artwork = { url: string; name: string; size: number; type: string };

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  options: { label: string; value: string }[];
  quantity: number;
  total: number | null; // null = quote request
  artwork: Artwork[];
  designHelp: boolean;
  notes: string;
};

type Ctx = {
  items: CartItem[];
  ready: boolean;
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
  subtotal: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "rareb1rd-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
  }, []);
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const subtotal = items.reduce((sum, i) => sum + (i.total ?? 0), 0);

  return <CartContext.Provider value={{ items, ready, add, remove, clear, subtotal }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
