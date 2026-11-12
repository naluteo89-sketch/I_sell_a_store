"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { AdminProduct, Category, ProductForm } from "@/models/types";
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
export function useProductEditor(item: AdminProduct | null, categories: Category[], onSave: (form: ProductForm) => void) {
  const initial = useMemo(() => editorInitialState(item, categories), [item, categories]);
  const [base, setBase] = useState(initial.base);
  const [attributes, setAttributes] = useState(initial.attributes);
  const [options, setOptions] = useState<OptionRow[]>(initial.options);
  const [variants, setVariants] = useState<Record<string, VariantState>>(initial.variants);

  const parsedOptions = parseOptions(options);
  const combos = combinations(parsedOptions);
  const variantOf = (key: string) => variants[key] ?? DEFAULT_VARIANT;

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

    submit: (e: FormEvent) => {
      e.preventDefault();
      onSave({
        ...base,
        attributes: attributes.filter((a) => a.name.trim() && a.value.trim()),
        options: parsedOptions,
        variants: combos.map((pairs) => ({ options: Object.fromEntries(pairs), ...variantOf(keyOf(pairs)) })),
      });
    },
  };
}
