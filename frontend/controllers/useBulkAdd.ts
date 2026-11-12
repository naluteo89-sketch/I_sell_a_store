"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/models/types";
import { useCart } from "./useCart";

/** 옵션 없이 바로 담을 수 있는 상품인지 (옵션 상품은 상품 페이지에서 조합을 골라야 함) */
export const canQuickAdd = (p: Product) => p.stock > 0 && (p.options.length === 0 || p.variants.length === 0);

type Result = { added: number; needsOptions: number } | null;

/** C — 영상 모아보기에서 여러 상품을 골라 한번에 장바구니에 담기 */
export function useBulkAdd(products: Product[]) {
  const add = useCart((s) => s.add);
  const eligible = useMemo(() => products.filter(canQuickAdd), [products]);
  const needsOptions = useMemo(() => products.filter((p) => p.stock > 0 && !canQuickAdd(p)), [products]);
  // 처음에는 담을 수 있는 상품을 모두 선택해 둔다 (한 번 눌러 전부 담기)
  const [selected, setSelected] = useState<Set<number>>(() => new Set(eligible.map((p) => p.id)));
  const [result, setResult] = useState<Result>(null);
  const [warn, setWarn] = useState(false);

  const putAll = (items: Product[]) => {
    items.forEach((p) =>
      add({ productId: p.id, variantId: null, name: p.name, optionLabel: null, price: p.price, imageUrl: p.imageUrl }, 1),
    );
    setResult({ added: items.length, needsOptions: needsOptions.length });
  };

  return {
    eligible,
    needsOptions,
    selected,
    isSelected: (id: number) => selected.has(id),
    toggle: (id: number) => {
      setWarn(false);
      setResult(null);
      setSelected((s) => {
        const next = new Set(s);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    allSelected: eligible.length > 0 && eligible.every((p) => selected.has(p.id)),
    toggleAll: () => {
      setResult(null);
      setSelected((s) => (eligible.every((p) => s.has(p.id)) ? new Set() : new Set(eligible.map((p) => p.id))));
    },
    addSelected: () => {
      const items = eligible.filter((p) => selected.has(p.id));
      if (items.length === 0) return setWarn(true);
      setWarn(false);
      putAll(items);
    },
    addAll: () => {
      setWarn(false);
      setSelected(new Set(eligible.map((p) => p.id)));
      putAll(eligible);
    },
    result,
    warn,
  };
}
