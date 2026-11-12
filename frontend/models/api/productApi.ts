import type { Locale } from "@/lib/i18n/config";
import type { Product, ProductSort, Video } from "../types";
import { get, withLang } from "./http";

/** 목록: 이 언어(시장) 대상 상품만, 이름·설명은 이 언어로 */
export function fetchProducts(lang: Locale, params: { category?: string; q?: string; sort?: ProductSort } = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  if (params.sort && params.sort !== "new") qs.set("sort", params.sort);
  const query = qs.toString();
  return get<Product[]>(withLang(`/api/products${query ? `?${query}` : ""}`, lang)).catch(() => [] as Product[]);
}

export const fetchProduct = (id: string, lang: Locale) => get<Product>(withLang(`/api/products/${encodeURIComponent(id)}`, lang));

export const fetchRelated = (id: number, lang: Locale) =>
  get<Product[]>(withLang(`/api/products/${id}/related`, lang)).catch(() => [] as Product[]);

/** 방문자용 영상 목록 (백엔드 DB만 읽음). 영어면 영어권 유튜버 영상 */
export const fetchVideos = (productId: number, lang: Locale) => get<Video[]>(withLang(`/api/products/${productId}/videos`, lang));
