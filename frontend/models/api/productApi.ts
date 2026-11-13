import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Product, ProductSort, Video } from "../types";
import { get, withLang, getPage } from "./http";

/** 목록: 이 언어(시장) 대상 상품만, 이름·설명은 이 언어로 */
export const PAGE_SIZE = 40;

type ListParams = { category?: string; q?: string; sort?: ProductSort; page?: number; size?: number };

/**
 * 상품 목록 한 페이지 + 전체 개수. 정렬·검색·페이지 나눔은 백엔드(SQL)가 한다.
 * 같은 요청 안에서 목록과 개수 표시가 같은 조건으로 부르면 한 번만 호출된다 (React cache — 인자는 원시값이어야 함)
 */
export function fetchProducts(lang: Locale, params: ListParams = {}) {
  return fetchProductsCached(lang, params.category ?? "", params.q ?? "", params.sort ?? "new", params.page ?? 1, params.size ?? PAGE_SIZE);
}

const fetchProductsCached = cache((lang: Locale, category: string, q: string, sort: string, page: number, size: number) => {
  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  qs.set("size", String(size));
  if (category) qs.set("category", category);
  if (q) qs.set("q", q);
  if (sort !== "new") qs.set("sort", sort);
  return getPage<Product>(withLang(`/api/products?${qs}`, lang), page, size).catch(() => ({ items: [] as Product[], total: 0 }));
});

export const fetchProduct = (id: string, lang: Locale) => get<Product>(withLang(`/api/products/${encodeURIComponent(id)}`, lang));

export const fetchRelated = (id: number, lang: Locale) =>
  get<Product[]>(withLang(`/api/products/${id}/related`, lang)).catch(() => [] as Product[]);

/** 방문자용 영상 목록 (백엔드 DB만 읽음). 영어면 영어권 유튜버 영상 */
export const fetchVideos = (productId: number, lang: Locale) => get<Video[]>(withLang(`/api/products/${productId}/videos`, lang));
