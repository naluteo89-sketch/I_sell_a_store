import type { AdminProduct, Category } from "@/models/types";

/** 관리자 편집기용 순수 계산 (화면·상태와 무관) */

export type OptionRow = { name: string; valuesText: string };
export type VariantState = { additionalPrice: number; stock: number; sku: string; active: boolean };
export type ParsedOption = { name: string; values: string[] };

export const DEFAULT_VARIANT: VariantState = { additionalPrice: 0, stock: 0, sku: "", active: true };

/** "블랙, 화이트 , 블랙" → ["블랙", "화이트"] */
export const parseValues = (text: string) => Array.from(new Set(text.split(",").map((s) => s.trim()).filter(Boolean)));

/** 조합 키: "색상=블랙|사이즈=M" */
export const keyOf = (pairs: [string, string][]) => pairs.map(([o, v]) => `${o}=${v}`).join("|");

export function parseOptions(rows: OptionRow[]): ParsedOption[] {
  return rows.map((o) => ({ name: o.name.trim(), values: parseValues(o.valuesText) })).filter((o) => o.name && o.values.length > 0);
}

/** 옵션 선택지들의 모든 조합 */
export function combinations(options: ParsedOption[]): [string, string][][] {
  return options
    .reduce<[string, string][][]>(
      (acc, o) => acc.flatMap((combo) => o.values.map((v) => [...combo, [o.name, v] as [string, string]])),
      [[]],
    )
    .filter((c) => c.length > 0);
}

/** 기존 상품 → 편집 초기값 */
export function editorInitialState(item: AdminProduct | null, categories: Category[]) {
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

/** 유튜브 주소 또는 영상 ID에서 11자리 ID만 뽑는다 */
export function toVideoId(input: string): string | null {
  const s = input.trim();
  const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(s) ? s : null;
}
