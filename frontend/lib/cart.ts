"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 장바구니 한 줄 = 상품 + 조합(옵션). 옵션 없는 상품은 variantId 가 null */
export type CartLine = {
  key: string;
  productId: number;
  variantId: number | null;
  name: string;
  optionLabel: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

export const lineKey = (productId: number, variantId: number | null) => `${productId}:${variantId ?? "-"}`;

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

/** 장바구니는 브라우저(localStorage)에 저장. 주문 때 서버가 가격·재고를 다시 확인한다. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, quantity = 1) =>
        set((s) => {
          const key = lineKey(line.productId, line.variantId);
          const found = s.lines.find((l) => l.key === key);
          if (found) {
            return {
              lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l)),
            };
          }
          return { lines: [...s.lines, { ...line, key, quantity }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(99, Math.max(1, quantity)) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    // v2: 조합(옵션) 단위로 구조가 바뀌어 이전 장바구니는 버린다
    { name: "isellastore-cart-v2" },
  ),
);

export const cartTotal = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
