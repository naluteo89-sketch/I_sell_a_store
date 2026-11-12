"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

/** 장바구니는 브라우저(localStorage)에 저장. 결제 시 서버가 가격을 다시 계산한다. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, quantity = 1) =>
        set((s) => {
          const found = s.lines.find((l) => l.productId === line.productId);
          if (found) {
            return {
              lines: s.lines.map((l) =>
                l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, quantity }] };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.productId === productId ? { ...l, quantity: Math.max(1, quantity) } : l)),
        })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "isellastore-cart" },
  ),
);

export const cartTotal = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
