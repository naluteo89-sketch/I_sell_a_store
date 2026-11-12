"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { AdminProduct, Category, ProductForm, ProductFormVariant } from "@/lib/api";

type OptionRow = { name: string; valuesText: string };
type VariantState = Omit<ProductFormVariant, "options">;

const DEFAULT_VARIANT: VariantState = { additionalPrice: 0, stock: 0, sku: "", active: true };

const parseValues = (text: string) =>
  Array.from(new Set(text.split(",").map((s) => s.trim()).filter(Boolean)));

/** 조합 키 (백엔드와 같은 형식): "색상=블랙|사이즈=M" */
const keyOf = (pairs: [string, string][]) => pairs.map(([o, v]) => `${o}=${v}`).join("|");

/** 옵션 선택지들의 모든 조합 */
function combinations(options: { name: string; values: string[] }[]): [string, string][][] {
  return options.reduce<[string, string][][]>(
    (acc, o) => acc.flatMap((combo) => o.values.map((v) => [...combo, [o.name, v] as [string, string]])),
    [[]],
  );
}

/** 기존 상품 → 편집 상태 */
function fromProduct(item: AdminProduct | null, categories: Category[]) {
  if (!item) {
    return {
      base: { name: "", description: "", price: 0, stock: 0, imageUrl: "", categorySlug: categories[0]?.slug ?? "", youtubeKeyword: "" },
      attributes: [] as { name: string; value: string }[],
      options: [] as OptionRow[],
      variants: {} as Record<string, VariantState>,
    };
  }
  const p = item.product;
  const valueName = new Map<number, [string, string]>();
  p.options.forEach((o) => o.values.forEach((v) => valueName.set(v.id, [o.name, v.name])));
  const variants: Record<string, VariantState> = {};
  p.variants.forEach((v) => {
    const pairs = p.options
      .map((o) => v.optionValueIds.map((id) => valueName.get(id)).find((x) => x?.[0] === o.name))
      .filter((x): x is [string, string] => !!x);
    variants[keyOf(pairs)] = { additionalPrice: v.additionalPrice, stock: v.stock, sku: v.sku ?? "", active: true };
  });
  return {
    base: {
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      stock: p.options.length ? 0 : p.stock,
      imageUrl: p.imageUrl ?? "",
      categorySlug: p.categorySlug ?? "",
      youtubeKeyword: item.youtubeKeyword ?? "",
    },
    attributes: p.attributes.map((a) => ({ ...a })),
    options: p.options.map((o) => ({ name: o.name, valuesText: o.values.map((v) => v.name).join(", ") })),
    variants,
  };
}

export default function ProductEditor({
  item,
  categories,
  busy,
  onSave,
}: {
  item: AdminProduct | null;
  categories: Category[];
  busy: boolean;
  onSave: (form: ProductForm) => void;
}) {
  const initial = useMemo(() => fromProduct(item, categories), [item, categories]);
  const [base, setBase] = useState(initial.base);
  const [attributes, setAttributes] = useState(initial.attributes);
  const [options, setOptions] = useState<OptionRow[]>(initial.options);
  const [variants, setVariants] = useState<Record<string, VariantState>>(initial.variants);

  const parsedOptions = options
    .map((o) => ({ name: o.name.trim(), values: parseValues(o.valuesText) }))
    .filter((o) => o.name && o.values.length > 0);
  const combos = combinations(parsedOptions).filter((c) => c.length > 0);
  const hasOptions = combos.length > 0;

  const variantOf = (key: string) => variants[key] ?? DEFAULT_VARIANT;
  const setVariant = (key: string, patch: Partial<VariantState>) =>
    setVariants((v) => ({ ...v, [key]: { ...variantOf(key), ...patch } }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...base,
      attributes: attributes.filter((a) => a.name.trim() && a.value.trim()),
      options: parsedOptions,
      variants: combos.map((pairs) => ({ options: Object.fromEntries(pairs), ...variantOf(keyOf(pairs)) })),
    });
  };

  const input = "w-full rounded-lg border px-3 py-2 text-sm";
  const small = "w-full rounded border px-2 py-1 text-sm";

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border p-5">
      <h2 className="font-semibold">{item ? "상품 수정" : "새 상품 등록"}</h2>

      {/* 기본 정보 */}
      <div className="space-y-3">
        <input required placeholder="상품명" className={input} value={base.name}
          onChange={(e) => setBase({ ...base, name: e.target.value })} />
        <textarea placeholder="설명" rows={3} className={input} value={base.description}
          onChange={(e) => setBase({ ...base, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">
            기본 가격(원)
            <input type="number" min={0} className={input} value={base.price}
              onChange={(e) => setBase({ ...base, price: Number(e.target.value) })} />
          </label>
          <label className="text-xs text-gray-500">
            재고 {hasOptions && "(옵션 상품은 아래 조합별 재고)"}
            <input type="number" min={0} className={input} value={base.stock} disabled={hasOptions}
              onChange={(e) => setBase({ ...base, stock: Number(e.target.value) })} />
          </label>
        </div>
        <select className={input} value={base.categorySlug}
          onChange={(e) => setBase({ ...base, categorySlug: e.target.value })}>
          <option value="">카테고리 없음</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <input placeholder="이미지 URL (비우면 기본 이미지)" className={input} value={base.imageUrl}
          onChange={(e) => setBase({ ...base, imageUrl: e.target.value })} />
        <input placeholder="유튜브 검색어 (비우면 '상품명 리뷰')" className={input} value={base.youtubeKeyword}
          onChange={(e) => setBase({ ...base, youtubeKeyword: e.target.value })} />
      </div>

      {/* 사양 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">사양 <span className="text-xs text-gray-400">(소재, 원산지 등 표시용)</span></p>
          <button type="button" className="text-xs underline"
            onClick={() => setAttributes([...attributes, { name: "", value: "" }])}>+ 추가</button>
        </div>
        {attributes.map((a, i) => (
          <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
            <input placeholder="항목" className={small} value={a.name}
              onChange={(e) => setAttributes(attributes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <input placeholder="내용" className={small} value={a.value}
              onChange={(e) => setAttributes(attributes.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
            <button type="button" className="px-2 text-gray-400" onClick={() => setAttributes(attributes.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
      </div>

      {/* 옵션 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">옵션 <span className="text-xs text-gray-400">(선택지는 쉼표로 구분)</span></p>
          <button type="button" className="text-xs underline"
            onClick={() => setOptions([...options, { name: "", valuesText: "" }])}>+ 옵션 추가</button>
        </div>
        {options.map((o, i) => (
          <div key={i} className="grid grid-cols-[100px_1fr_auto] gap-2">
            <input placeholder="예: 색상" className={small} value={o.name}
              onChange={(e) => setOptions(options.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <input placeholder="예: 블랙, 화이트, 네이비" className={small} value={o.valuesText}
              onChange={(e) => setOptions(options.map((x, j) => (j === i ? { ...x, valuesText: e.target.value } : x)))} />
            <button type="button" className="px-2 text-gray-400" onClick={() => setOptions(options.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
      </div>

      {/* 조합별 재고·추가금 */}
      {hasOptions && (
        <div className="space-y-2">
          <p className="text-sm font-medium">조합별 재고·추가금 <span className="text-xs text-gray-400">({combos.length}개)</span></p>
          <div className="max-h-72 overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-2 py-1.5">조합</th>
                  <th className="px-2 py-1.5">추가금</th>
                  <th className="px-2 py-1.5">재고</th>
                  <th className="px-2 py-1.5">SKU</th>
                  <th className="px-2 py-1.5">판매</th>
                </tr>
              </thead>
              <tbody>
                {combos.map((pairs) => {
                  const key = keyOf(pairs);
                  const v = variantOf(key);
                  return (
                    <tr key={key} className="border-t">
                      <td className="whitespace-nowrap px-2 py-1">{pairs.map(([, val]) => val).join(" / ")}</td>
                      <td className="px-2 py-1">
                        <input type="number" step={100} className={small} value={v.additionalPrice}
                          onChange={(e) => setVariant(key, { additionalPrice: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" min={0} className={small} value={v.stock}
                          onChange={(e) => setVariant(key, { stock: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-1">
                        <input className={small} value={v.sku} placeholder="선택"
                          onChange={(e) => setVariant(key, { sku: e.target.value })} />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input type="checkbox" checked={v.active}
                          onChange={(e) => setVariant(key, { active: e.target.checked })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button disabled={busy} className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "저장 중…" : item ? "저장" : "등록 (유튜브 검색 1회 사용)"}
      </button>
    </form>
  );
}
