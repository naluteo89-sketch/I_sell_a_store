"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/models/types";
import { findVariant, hasOptions, isValueAvailable } from "@/lib/variants";
import { useCart } from "./useCart";

/** C — 상세 페이지 옵션 선택·수량·장바구니/바로구매 */
export function useProductPurchase(product: Product) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const withOptions = hasOptions(product);

  const [selected, setSelected] = useState<Record<number, number | undefined>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => (withOptions ? findVariant(product, selected) : null), [withOptions, product, selected]);

  const allChosen = !withOptions || variant !== null;
  const unitPrice = variant?.price ?? product.price;
  const stock = withOptions ? (variant?.stock ?? 0) : product.stock;
  const canBuy = allChosen && stock > 0 && quantity <= stock;

  const pick = (optionId: number, valueId: number) => {
    setAdded(false);
    setQuantity(1);
    setSelected((s) => ({ ...s, [optionId]: s[optionId] === valueId ? undefined : valueId }));
  };

  const putInCart = () =>
    add(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        name: product.name,
        optionLabel: variant?.label ?? null,
        price: unitPrice,
        imageUrl: product.imageUrl,
      },
      quantity,
    );

  return {
    withOptions,
    selected,
    variant,
    allChosen,
    unitPrice,
    stock,
    quantity,
    canBuy,
    added,
    soldOut: product.stock <= 0,
    isAvailable: (optionId: number, valueId: number) => isValueAvailable(product, selected, optionId, valueId),
    pick,
    setQuantity: (q: number) => setQuantity(Math.min(Math.max(1, stock), 99, Math.max(1, q))),
    addToCart: () => {
      putInCart();
      setAdded(true);
    },
    buyNow: () => {
      putInCart();
      router.push("/checkout");
    },
  };
}
