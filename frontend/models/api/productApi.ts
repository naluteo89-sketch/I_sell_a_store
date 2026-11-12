import type { Product, ProductSort, Video } from "../types";
import { get } from "./http";

export function fetchProducts(params: { category?: string; q?: string; sort?: ProductSort } = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  if (params.sort && params.sort !== "new") qs.set("sort", params.sort);
  const query = qs.toString();
  return get<Product[]>(`/api/products${query ? `?${query}` : ""}`).catch(() => [] as Product[]);
}

export const fetchProduct = (id: string) => get<Product>(`/api/products/${encodeURIComponent(id)}`);

export const fetchRelated = (id: number) =>
  get<Product[]>(`/api/products/${id}/related`).catch(() => [] as Product[]);

/** 방문자용 영상 목록 (백엔드 DB만 읽음) */
export const fetchVideos = (productId: number) => get<Video[]>(`/api/products/${productId}/videos`);
