"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/models/types";

export const lineKey = (productId: number, variantId: number | null) => `${productId}:${variantId ?? "-"}`;

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

/** C (Controller) — 장바구니 상태. 브라우저(localStorage)에 저장, 주문 때 서버가 가격·재고를 다시 확인한다. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, quantity = 1) =>
        set((s) => {
          const key = lineKey(line.productId, line.variantId);
          const found = s.lines.find((l) => l.key === key);
          if (found) {
            return { lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l)) };
          }
          return { lines: [...s.lines, { ...line, key, quantity }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(99, Math.max(1, quantity)) } : l)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "isellastore-cart-v2" },
  ),
);

export const cartTotal = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
