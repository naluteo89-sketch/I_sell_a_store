import type { Locale } from "@/lib/i18n/config";
import type { VideoCollection, VideoSort } from "../types";
import { get, withLang } from "./http";

/**
 * 리뷰 영상별 상품 모아보기 API (규격: docs/market-api.md)
 * 언어별로 그 언어 유튜버 영상만 온다. 백엔드가 아직 없으면 목록은 빈 배열, 상세는 null(404).
 */
export function fetchVideoCollections(lang: Locale, opts: { limit?: number; sort?: VideoSort; q?: string; minProducts?: number } = {}) {
  const qs = new URLSearchParams({ minProducts: String(opts.minProducts ?? 2), limit: String(opts.limit ?? 24) });
  if (opts.sort && opts.sort !== "views") qs.set("sort", opts.sort);
  // q: 영상 제목 + 유튜버(채널) 이름으로 찾기
  if (opts.q) qs.set("q", opts.q);
  return get<VideoCollection[]>(withLang(`/api/videos?${qs}`, lang)).catch(() => [] as VideoCollection[]);
}

export const VIDEO_SORTS: VideoSort[] = ["views", "channelViews", "new"];
export const isVideoSort = (v: unknown): v is VideoSort => VIDEO_SORTS.includes(v as VideoSort);

export const fetchVideoCollection = (videoId: string, lang: Locale) =>
  get<VideoCollection>(withLang(`/api/videos/${encodeURIComponent(videoId)}`, lang)).catch(() => null);

/** 유튜브 영상 ID 형식 (11자) — 잘못된 주소는 바로 404 */
export const isVideoId = (v: string) => /^[A-Za-z0-9_-]{11}$/.test(v);
