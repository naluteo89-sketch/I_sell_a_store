import type { AdminProduct, AdminVideoView, ProductForm, Video } from "../types";
import { get, send } from "./http";

/** 관리자 API (⚠️ 관리자 로그인 붙이기 전까지 로컬 전용) */
export const adminApi = {
  products: () => get<AdminProduct[]>("/api/admin/products"),
  create: (form: ProductForm) => send<AdminProduct>("/api/admin/products", "POST", form),
  update: (id: number, form: ProductForm) => send<AdminProduct>(`/api/admin/products/${id}`, "PUT", form),
  deactivate: (id: number) => send<void>(`/api/admin/products/${id}`, "DELETE"),
  activate: (id: number) => send<void>(`/api/admin/products/${id}/activate`, "POST"),
  videos: (id: number) => get<AdminVideoView>(`/api/admin/products/${id}/videos`),
  refreshVideos: (id: number) => send<Video[]>(`/api/admin/products/${id}/videos/refresh`, "POST"),
  curate: (id: number, body: { pinnedVideoIds?: string[]; excludedVideoIds?: string[]; hidden?: boolean }) =>
    send<Video[]>(`/api/admin/products/${id}/videos/curation`, "PUT", body),
};
