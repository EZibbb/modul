"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export type CartItem = {
  sku: string;
  name: string;
  priceBase: number;
  pricePartner: number | null;
  oemPrice: number | null;
  qty: number;
};

export type CompareItem = {
  sku: string;
  name: string;
  formFactor: string;
  speedGbps: number | null;
  mediaType: string | null;
  reachM: number | null;
  wavelengthNm: number | null;
  connector: string | null;
  tempRange: string | null;
  domSupport: boolean;
  priceBase: number;
  oemPrice: number | null;
};

type Store = {
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  compare: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (sku: string) => void;
  clearCompare: () => void;
  inCompare: (sku: string) => boolean;
  COMPARE_MAX: number;
  // ИИ-со-пилот
  aiOpen: boolean;
  aiSeed: string | null;
  openAi: (seed?: string) => void;
  closeAi: () => void;
};

const COMPARE_MAX = 4;
const Ctx = createContext<Store | null>(null);
const LS_CART = "modul-cart";
const LS_CMP = "modul-compare";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [compare, setCompare] = useState<CompareItem[]>([]);
  const [ready, setReady] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(LS_CART) || "[]"));
      setCompare(JSON.parse(localStorage.getItem(LS_CMP) || "[]"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(LS_CMP, JSON.stringify(compare));
  }, [compare, ready]);

  const addToCart = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setCart((c) => {
      const ex = c.find((x) => x.sku === item.sku);
      if (ex) return c.map((x) => (x.sku === item.sku ? { ...x, qty: x.qty + qty } : x));
      return [...c, { ...item, qty }];
    });
  }, []);
  const setQty = useCallback((sku: string, qty: number) => {
    setCart((c) => c.map((x) => (x.sku === sku ? { ...x, qty: Math.max(1, qty) } : x)));
  }, []);
  const removeFromCart = useCallback((sku: string) => setCart((c) => c.filter((x) => x.sku !== sku)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const addToCompare = useCallback((item: CompareItem) => {
    setCompare((c) => {
      if (c.some((x) => x.sku === item.sku)) return c.filter((x) => x.sku !== item.sku); // toggle
      if (c.length >= COMPARE_MAX) return c;
      return [...c, item];
    });
  }, []);
  const removeFromCompare = useCallback((sku: string) => setCompare((c) => c.filter((x) => x.sku !== sku)), []);
  const clearCompare = useCallback(() => setCompare([]), []);

  const value = useMemo<Store>(
    () => ({
      cart,
      cartCount: cart.reduce((s, x) => s + x.qty, 0),
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      compare,
      addToCompare,
      removeFromCompare,
      clearCompare,
      inCompare: (sku: string) => compare.some((x) => x.sku === sku),
      COMPARE_MAX,
      aiOpen,
      aiSeed,
      openAi: (seed?: string) => { setAiSeed(seed ?? null); setAiOpen(true); },
      closeAi: () => setAiOpen(false),
    }),
    [cart, compare, addToCart, setQty, removeFromCart, clearCart, addToCompare, removeFromCompare, clearCompare, aiOpen, aiSeed],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
