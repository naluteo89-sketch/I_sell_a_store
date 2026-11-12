"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/api";
import { useCart } from "@/lib/cart";

export default function AddToCart({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  const line = { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">수량</span>
        <div className="flex items-center rounded-lg border">
          <button type="button" className="px-3 py-1.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            type="button"
            className="px-3 py-1.5"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          >
            +
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            add(line, qty);
            setAdded(true);
          }}
          className="flex-1 rounded-xl border border-brand py-3 font-semibold text-brand disabled:opacity-40"
        >
          {added ? "담았습니다" : "장바구니"}
        </button>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            add(line, qty);
            router.push("/checkout");
          }}
          className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-40"
        >
          {soldOut ? "품절" : "바로 구매"}
        </button>
      </div>
    </div>
  );
}
