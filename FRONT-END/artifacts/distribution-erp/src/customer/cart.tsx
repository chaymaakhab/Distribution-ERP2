import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from './api';

export interface CartLine {
  product_id: number;
  code: string;
  name: string;
  image: string | null;
  unit: string;
  price_ht: number;
  vat_rate: number;
  available_qty: number;
  quantity: number;
}

const CART_KEY = 'hercules.customer.cart';

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotalHt: number;
  vatTotal: number;
  totalTtc: number;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  addMany: (lines: CartLine[]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalHt = lines.reduce((s, l) => s + l.price_ht * l.quantity, 0);
    const vatTotal = lines.reduce((s, l) => s + l.price_ht * l.quantity * (l.vat_rate / 100), 0);
    return {
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotalHt: round(subtotalHt),
      vatTotal: round(vatTotal),
      totalTtc: round(subtotalHt + vatTotal),
      add: (product, qty = product.min_order_qty || 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.product_id === product.id);
          if (existing) {
            return prev.map((l) =>
              l.product_id === product.id
                ? { ...l, quantity: Math.min(l.quantity + qty, Math.max(l.available_qty, qty)) }
                : l,
            );
          }
          return [
            ...prev,
            {
              product_id: product.id,
              code: product.code,
              name: product.name,
              image: product.image,
              unit: product.unit,
              price_ht: product.price_ht,
              vat_rate: product.vat_rate,
              available_qty: product.available_qty,
              quantity: Math.min(qty, Math.max(product.available_qty, qty)),
            },
          ];
        }),
      setQty: (productId, qty) =>
        setLines((prev) =>
          prev.map((l) =>
            l.product_id === productId ? { ...l, quantity: Math.max(1, qty) } : l,
          ),
        ),
      remove: (productId) => setLines((prev) => prev.filter((l) => l.product_id !== productId)),
      clear: () => setLines([]),
      addMany: (newLines) =>
        setLines((prev) => {
          const merged = [...prev];
          for (const nl of newLines) {
            const existing = merged.find((l) => l.product_id === nl.product_id);
            if (existing) existing.quantity += nl.quantity;
            else merged.push(nl);
          }
          return merged;
        }),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function formatMoney(n: number): string {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
}
