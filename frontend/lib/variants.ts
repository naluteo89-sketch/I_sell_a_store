import type { Product, ProductVariant } from "@/models/types";

/** 고른 선택지(옵션ID → 선택지ID)에 맞는 조합 찾기. 다 안 골랐으면 null */
export function findVariant(product: Product, selected: Record<number, number | undefined>): ProductVariant | null {
  if (product.options.some((o) => selected[o.id] === undefined)) return null;
  return product.variants.find((v) => product.options.every((o) => v.optionValueIds.includes(selected[o.id]!))) ?? null;
}

/** 지금까지 고른 다른 옵션과 함께 살 수 있는(재고 있는) 선택지인지 */
export function isValueAvailable(
  product: Product,
  selected: Record<number, number | undefined>,
  optionId: number,
  valueId: number,
): boolean {
  return product.variants.some(
    (v) =>
      v.stock > 0 &&
      v.optionValueIds.includes(valueId) &&
      product.options.every(
        (o) => o.id === optionId || selected[o.id] === undefined || v.optionValueIds.includes(selected[o.id]!),
      ),
  );
}

/** 목록·상세에 보여줄 가격 범위 */
export function priceRange(product: Product): { min: number; max: number } {
  const prices = product.variants?.map((v) => v.price) ?? [];
  if (prices.length === 0) return { min: product.price, max: product.price };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export const hasOptions = (product: Product) => product.options.length > 0 && product.variants.length > 0;
