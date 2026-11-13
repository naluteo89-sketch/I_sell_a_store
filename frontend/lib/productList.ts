import type { ProductSort } from "@/models/types";

/** 목록 정렬 종류 (라벨은 사전 t.list.sorts 에 있음) */
export const SORT_IDS: ProductSort[] = ["new", "videoViews", "channelViews", "priceAsc", "priceDesc", "name"];

export type ListQuery = { category?: string; q?: string; sort?: string };

export const isSort = (v: unknown): v is ProductSort => SORT_IDS.includes(v as ProductSort);

/** 현재 조건을 유지한 채 일부만 바꾼 목록 주소 */
/** 같은 조건의 다른 페이지 (조건을 바꾸는 listHref 는 항상 1페이지로 돌아간다) */
export function pageHref(current: ListQuery, page: number) {
  const base = listHref(current, {});
  if (page <= 1) return base;
  return `${base}${base.includes("?") ? "&" : "?"}page=${page}`;
}

export function listHref(current: ListQuery, patch: ListQuery) {
  const merged = { ...current, ...patch };
  const qs = new URLSearchParams();
  if (merged.category) qs.set("category", merged.category);
  if (merged.q) qs.set("q", merged.q);
  if (merged.sort && merged.sort !== "new") qs.set("sort", merged.sort);
  const s = qs.toString();
  return `/products${s ? `?${s}` : ""}`;
}
