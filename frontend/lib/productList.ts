import type { ProductSort } from "@/models/types";

/** 목록 정렬 종류 (라벨은 사전 t.list.sorts 에 있음) */
export const SORT_IDS: ProductSort[] = ["new", "videoViews", "channelViews", "priceAsc", "priceDesc", "name"];

export type ListView = "products" | "videos";
export type ListQuery = { category?: string; q?: string; sort?: string; view?: ListView };

/** 보기 방식은 쿠키로 기억 → 다음 방문에도 같은 방식으로 (서버가 첫 화면부터 맞게 그림) */
export const VIEW_COOKIE = "listView";
export const isView = (v: unknown): v is ListView => v === "products" || v === "videos";

/** 영상별 보기에서 의미 있는 정렬만 (가격·이름은 영상 묶음에 맞지 않음) */
export const VIDEO_VIEW_SORTS: ProductSort[] = ["videoViews", "channelViews", "new"];

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
  if (merged.view) qs.set("view", merged.view);
  const s = qs.toString();
  return `/products${s ? `?${s}` : ""}`;
}
