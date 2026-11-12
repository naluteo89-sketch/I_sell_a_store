"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { AdminProduct, Category, Market, ProductForm } from "@/models/types";
import { findImageOwner } from "@/lib/videoGroups";
import {
  combinations,
  DEFAULT_VARIANT,
  editorInitialState,
  keyOf,
  parseOptions,
  type OptionRow,
  type VariantState,
} from "@/lib/variantGrid";

/** C — 관리자 상품 편집기 상태 (기본 정보·사양·옵션·조합표) */
/** others: 전체 상품 목록 — 같은 이미지를 쓰는 다른 상품이 있는지(1이미지 1상품) 확인용 */
export function useProductEditor(
  item: AdminProduct | null,
  categories: Category[],
  onSave: (form: ProductForm) => void,
  others: AdminProduct[] = [],
) {
  const initial = useMemo(() => editorInitialState(item, categories), [item, categories]);
  const [base, setBase] = useState(initial.base);
  const [attributes, setAttributes] = useState(initial.attributes);
  const [options, setOptions] = useState<OptionRow[]>(initial.options);
  const [variants, setVariants] = useState<Record<string, VariantState>>(initial.variants);

  const parsedOptions = parseOptions(options);
  const combos = combinations(parsedOptions);
  const variantOf = (key: string) => variants[key] ?? DEFAULT_VARIANT;

  // 1이미지 1상품: 이미 다른 상품이 쓰는 이미지면 저장을 막는다
  const imageOwner = findImageOwner(others, base.imageUrl, item?.product.id ?? null);
  const sellsUS = base.markets.includes("US");
  const [problem, setProblem] = useState<string | null>(null);

  return {
    base,
    updateBase: <K extends keyof typeof initial.base>(field: K, value: (typeof initial.base)[K]) =>
      setBase((b) => ({ ...b, [field]: value })),

    attributes,
    addAttribute: () => setAttributes((a) => [...a, { name: "", value: "" }]),
    updateAttribute: (i: number, patch: Partial<{ name: string; value: string }>) =>
      setAttributes((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x))),
    removeAttribute: (i: number) => setAttributes((a) => a.filter((_, j) => j !== i)),

    options,
    addOption: () => setOptions((o) => [...o, { name: "", valuesText: "" }]),
    updateOption: (i: number, patch: Partial<OptionRow>) => setOptions((o) => o.map((x, j) => (j === i ? { ...x, ...patch } : x))),
    removeOption: (i: number) => setOptions((o) => o.filter((_, j) => j !== i)),

    combos,
    hasOptions: combos.length > 0,
    variantOf,
    updateVariant: (key: string, patch: Partial<VariantState>) =>
      setVariants((v) => ({ ...v, [key]: { ...variantOf(key), ...patch } })),

    imageOwner,
    sellsUS,
    problem,
    toggleMarket: (m: Market) =>
      setBase((b) => ({ ...b, markets: b.markets.includes(m) ? b.markets.filter((x) => x !== m) : [...b.markets, m] })),

    submit: (e: FormEvent) => {
      e.preventDefault();
      if (base.markets.length === 0) return setProblem("판매 지역을 하나 이상 골라 주세요.");
      if (imageOwner) return setProblem(`이 이미지는 이미 "${imageOwner.product.name}" 상품이 쓰고 있습니다. 상품마다 다른 이미지를 넣어 주세요.`);
      if (sellsUS && !base.nameEn.trim()) return setProblem("영미권에 판매하려면 영문 상품명을 넣어 주세요.");
      setProblem(null);
      onSave({
        ...base,
        attributes: attributes.filter((a) => a.name.trim() && a.value.trim()),
        options: parsedOptions,
        variants: combos.map((pairs) => ({ options: Object.fromEntries(pairs), ...variantOf(keyOf(pairs)) })),
      });
    },
  };
}
