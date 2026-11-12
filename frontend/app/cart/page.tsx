"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductImage from "@/components/ProductImage";
import { cartTotal, useCart } from "@/lib/cart";
import { won } from "@/lib/format";

export default function CartPage() {
  const { lines, setQuantity, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500">장바구니가 비어 있습니다.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm text-white">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">장바구니</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y rounded-2xl border">
          {lines.map((l) => (
            <li key={l.key} className="flex flex-wrap items-center gap-4 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                <ProductImage src={l.imageUrl} name={l.name} />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${l.productId}`} className="font-medium hover:underline">
                  {l.name}
                </Link>
                {l.optionLabel && <p className="text-sm text-gray-500">옵션: {l.optionLabel}</p>}
                <p className="text-sm text-gray-500">{won(l.price)}</p>
              </div>
              <div className="flex items-center rounded-lg border">
                <button type="button" className="px-3 py-1" onClick={() => setQuantity(l.key, l.quantity - 1)}>
                  −
                </button>
                <span className="w-8 text-center">{l.quantity}</span>
                <button type="button" className="px-3 py-1" onClick={() => setQuantity(l.key, l.quantity + 1)}>
                  +
                </button>
              </div>
              <p className="w-24 text-right font-semibold">{won(l.price * l.quantity)}</p>
              <button type="button" onClick={() => remove(l.key)} className="text-sm text-gray-400 hover:text-gray-700">
                삭제
              </button>
            </li>
          ))}
        </ul>
        <div className="h-fit space-y-4 rounded-2xl border p-6">
          <div className="flex justify-between text-sm text-gray-500">
            <span>배송비</span>
            <span>무료</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>합계</span>
            <span>{won(cartTotal(lines))}</span>
          </div>
          <p className="text-xs text-gray-400">가격·재고는 주문할 때 다시 확인됩니다.</p>
          <Link href="/checkout" className="block rounded-xl bg-brand py-3 text-center font-semibold text-white">
            주문하기
          </Link>
        </div>
      </div>
    </div>
  );
}
