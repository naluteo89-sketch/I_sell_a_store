import type { Locale } from "@/lib/i18n/config";
import type { Product, ProductSort, Video } from "../types";
import { get, withLang, getPage } from "./http";

/** 목록: 이 언어(시장) 대상 상품만, 이름·설명은 이 언어로 */
export const PAGE_SIZE = 40;

/** 상품 목록 한 페이지 + 전체 개수. 정렬·검색·페이지 나눔은 백엔드(SQL)가 한다 */
export function fetchProducts(lang: Locale, params: { category?: string; q?: string; sort?: ProductSort; page?: number; size?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  qs.set("size", String(params.size ?? PAGE_SIZE));
  if (params.category) qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  if (params.sort && params.sort !== "new") qs.set("sort", params.sort);
  const query = qs.toString();
  return getPage<Product>(withLang(`/api/products${query ? `?${query}` : ""}`, lang)).catch(() => ({ items: [] as Product[], total: 0 }));
}

export const fetchProduct = (id: string, lang: Locale) => get<Product>(withLang(`/api/products/${encodeURIComponent(id)}`, lang));

export const fetchRelated = (id: number, lang: Locale) =>
  get<Product[]>(withLang(`/api/products/${id}/related`, lang)).catch(() => [] as Product[]);

/** 방문자용 영상 목록 (백엔드 DB만 읽음). 영어면 영어권 유튜버 영상 */
export const fetchVideos = (productId: number, lang: Locale) => get<Video[]>(withLang(`/api/products/${productId}/videos`, lang));
