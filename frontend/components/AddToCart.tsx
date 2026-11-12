"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductVariant } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { won } from "@/lib/format";

/**
 * 옵션 선택 + 수량 + 장바구니/바로구매.
 * - 옵션마다 선택지를 버튼으로 보여주고, 재고가 없는 조합은 고를 수 없게 흐리게 표시
 * - 모든 옵션을 고르면 해당 조합의 가격·재고로 바뀐다
 */
export default function AddToCart({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const hasOptions = product.options.length > 0 && product.variants.length > 0;

  const [selected, setSelected] = useState<Record<number, number>>({});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant: ProductVariant | null = useMemo(() => {
    if (!hasOptions) return null;
    if (product.options.some((o) => selected[o.id] === undefined)) return null;
    return (
      product.variants.find((v) => product.options.every((o) => v.optionValueIds.includes(selected[o.id]))) ?? null
    );
  }, [hasOptions, product, selected]);

  /** 지금까지 고른 다른 옵션과 함께 살 수 있는(재고 있는) 선택지인지 */
  const isAvailable = (optionId: number, valueId: number) =>
    product.variants.some(
      (v) =>
        v.stock > 0 &&
        v.optionValueIds.includes(valueId) &&
        product.options.every((o) => o.id === optionId || selected[o.id] === undefined || v.optionValueIds.includes(selected[o.id])),
    );

  const allChosen = !hasOptions || variant !== null;
  const unitPrice = variant?.price ?? product.price;
  const stock = hasOptions ? (variant?.stock ?? 0) : product.stock;
  const soldOut = hasOptions ? product.stock <= 0 : product.stock <= 0;
  const canBuy = allChosen && stock > 0 && qty <= stock;

  const pick = (optionId: number, valueId: number) => {
    setAdded(false);
    setQty(1);
    setSelected((s) => (s[optionId] === valueId ? { ...s, [optionId]: undefined as unknown as number } : { ...s, [optionId]: valueId }));
  };

  const putInCart = () => {
    add(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        name: product.name,
        optionLabel: variant?.label ?? null,
        price: unitPrice,
        imageUrl: product.imageUrl,
      },
      qty,
    );
  };

  return (
    <div className="space-y-5">
      {hasOptions &&
        product.options.map((o) => (
          <div key={o.id}>
            <p className="mb-2 text-sm font-medium">{o.name}</p>
            <div className="flex flex-wrap gap-2">
              {o.values.map((v) => {
                const active = selected[o.id] === v.id;
                const available = isAvailable(o.id, v.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => pick(o.id, v.id)}
                    disabled={!available && !active}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      active
                        ? "border-brand bg-brand text-white"
                        : available
                          ? "hover:border-gray-400"
                          : "cursor-not-allowed text-gray-300 line-through"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      <div className="flex items-end justify-between border-t pt-4">
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
              onClick={() => setQty((q) => Math.min(Math.max(1, stock), 99, q + 1))}
            >
              +
            </button>
          </div>
        </div>
        <div className="text-right">
          {hasOptions && !allChosen ? (
            <p className="text-sm text-gray-500">옵션을 선택해 주세요</p>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                {variant ? `${variant.label} · ` : ""}
                {stock > 0 ? `재고 ${stock}개` : "품절"}
              </p>
              <p className="text-xl font-bold">{won(unitPrice * qty)}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canBuy}
          onClick={() => {
            putInCart();
            setAdded(true);
          }}
          className="flex-1 rounded-xl border border-brand py-3 font-semibold text-brand disabled:opacity-40"
        >
          {added ? "담았습니다" : "장바구니"}
        </button>
        <button
          type="button"
          disabled={!canBuy}
          onClick={() => {
            putInCart();
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
