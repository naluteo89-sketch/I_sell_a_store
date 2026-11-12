"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { cartTotal, useCart } from "@/lib/cart";
import { won } from "@/lib/format";
import { useMounted } from "@/lib/useMounted";

export default function CartPage() {
  const { lines, setQuantity, remove } = useCart();
  if (!useMounted()) return null;

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
    <div className="grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y rounded-2xl border">
        {lines.map((l) => (
          <li key={l.productId} className="flex items-center gap-4 p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              <ProductImage src={l.imageUrl} name={l.name} />
            </div>
            <div className="flex-1">
              <Link href={`/products/${l.productId}`} className="font-medium">
                {l.name}
              </Link>
              <p className="text-sm text-gray-500">{won(l.price)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={l.quantity}
              onChange={(e) => setQuantity(l.productId, Number(e.target.value))}
              className="w-16 rounded-lg border px-2 py-1 text-center"
            />
            <p className="w-24 text-right font-semibold">{won(l.price * l.quantity)}</p>
            <button type="button" onClick={() => remove(l.productId)} className="text-sm text-gray-400">
              삭제
            </button>
          </li>
        ))}
      </ul>
      <div className="h-fit space-y-4 rounded-2xl border p-6">
        <div className="flex justify-between text-lg font-bold">
          <span>합계</span>
          <span>{won(cartTotal(lines))}</span>
        </div>
        <Link href="/checkout" className="block rounded-xl bg-brand py-3 text-center font-semibold text-white">
          주문하기
        </Link>
      </div>
    </div>
  );
}
