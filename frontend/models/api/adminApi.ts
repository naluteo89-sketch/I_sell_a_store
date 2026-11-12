import type { AdminProduct, AdminVideoView, ProductForm, Video } from "../types";
import type { Locale } from "@/lib/i18n/config";
import { get, send, withLang } from "./http";

/** 관리자 API (⚠️ 관리자 로그인 붙이기 전까지 로컬 전용) */
export const adminApi = {
  products: () => get<AdminProduct[]>("/api/admin/products"),
  create: (form: ProductForm) => send<AdminProduct>("/api/admin/products", "POST", form),
  update: (id: number, form: ProductForm) => send<AdminProduct>(`/api/admin/products/${id}`, "PUT", form),
  deactivate: (id: number) => send<void>(`/api/admin/products/${id}`, "DELETE"),
  activate: (id: number) => send<void>(`/api/admin/products/${id}/activate`, "POST"),
  /** 영상 관리는 언어(시장)별로 따로: ko = 한국어 유튜버, en = 영어권 유튜버 */
  videos: (id: number, lang: Locale) => get<AdminVideoView>(withLang(`/api/admin/products/${id}/videos`, lang)),
  refreshVideos: (id: number, lang: Locale) => send<Video[]>(withLang(`/api/admin/products/${id}/videos/refresh`, lang), "POST"),
  curate: (id: number, lang: Locale, body: { pinnedVideoIds?: string[]; excludedVideoIds?: string[]; hidden?: boolean }) =>
    send<Video[]>(withLang(`/api/admin/products/${id}/videos/curation`, lang), "PUT", body),
};
