import type { Locale } from "@/lib/i18n/config";
import type { VideoCollection, VideoSort } from "../types";
import { get, getPage, withLang } from "./http";

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

/** 상품 목록의 "영상별 보기": 카테고리·검색·정렬·페이지 나눔 + 전체 개수 */
export function fetchVideoPage(lang: Locale, opts: { category?: string; q?: string; sort?: string; page?: number; size?: number }) {
  const size = opts.size ?? 12;
  const qs = new URLSearchParams({ minProducts: "1", limit: String(size) });
  if (opts.page && opts.page > 1) qs.set("page", String(opts.page));
  if (opts.category) qs.set("category", opts.category);
  if (opts.q) qs.set("q", opts.q);
  // 상품 정렬 값을 영상 정렬로: 조회수·유튜버 인기·최신 (그 밖은 조회수순)
  qs.set("sort", opts.sort === "channelViews" ? "channelViews" : opts.sort === "new" ? "new" : "views");
  return getPage<VideoCollection>(withLang(`/api/videos?${qs}`, lang), opts.page ?? 1, size)
    .then(async (res) => {
      if (!res.legacy) return res;
      // 페이지 나눔을 모르는 옛 백엔드: 받을 수 있는 최대치(60개)를 받아 화면에서 나눈다 (재시작 전 임시)
      qs.set("limit", "60");
      qs.delete("page");
      return getPage<VideoCollection>(withLang(`/api/videos?${qs}`, lang), opts.page ?? 1, size);
    })
    .catch(() => ({ items: [] as VideoCollection[], total: 0 }));
}

export const VIDEO_SORTS: VideoSort[] = ["views", "channelViews", "new"];
export const isVideoSort = (v: unknown): v is VideoSort => VIDEO_SORTS.includes(v as VideoSort);

export const fetchVideoCollection = (videoId: string, lang: Locale) =>
  get<VideoCollection>(withLang(`/api/videos/${encodeURIComponent(videoId)}`, lang)).catch(() => null);

/** 유튜브 영상 ID 형식 (11자) — 잘못된 주소는 바로 404 */
export const isVideoId = (v: string) => /^[A-Za-z0-9_-]{11}$/.test(v);
