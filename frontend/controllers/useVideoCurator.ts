"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/models/api/adminApi";
import type { Locale } from "@/lib/i18n/config";
import type { AdminVideoView, Video } from "@/models/types";
import { toVideoId } from "@/lib/variantGrid";

/** C — 관리자 상품별 영상 고정·제외·숨김·재검색. lang 별로 따로 관리 (ko 한국어 유튜버 / en 영어권 유튜버) */
export function useVideoCurator(productId: number, lang: Locale) {
  const [view, setView] = useState<AdminVideoView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setView(await adminApi.videos(productId, lang));
    } catch {
      setError("영상 정보를 불러오지 못했습니다.");
    }
  }, [productId, lang]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "처리 실패");
    } finally {
      setBusy(false);
    }
  };

  const pinned = new Set(view?.pinnedVideoIds ?? []);
  const excluded = new Set(view?.excludedVideoIds ?? []);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  // 검색 결과에 없는 고정 영상도 목록에 보이도록 합친다
  const searchIds = new Set((view?.searchResults ?? []).map((v) => v.videoId));
  const rows: Video[] = view
    ? [
        ...view.pinnedVideoIds
          .filter((id) => !searchIds.has(id))
          .map((id) => ({ videoId: id, title: null, channelTitle: null, thumbnailUrl: null, viewCount: 0 })),
        ...view.searchResults,
      ]
    : [];

  return {
    view,
    rows,
    busy,
    error,
    isPinned: (id: string) => pinned.has(id),
    isExcluded: (id: string) => excluded.has(id),
    togglePin: (id: string) => view && run(() => adminApi.curate(productId, lang, { pinnedVideoIds: toggle(view.pinnedVideoIds, id) })),
    toggleExclude: (id: string) =>
      view && run(() => adminApi.curate(productId, lang, { excludedVideoIds: toggle(view.excludedVideoIds, id) })),
    setHidden: (hidden: boolean) => run(() => adminApi.curate(productId, lang, { hidden })),
    refresh: () => run(() => adminApi.refreshVideos(productId, lang)),
    /** 영상 주소/ID 직접 고정. 형식이 틀리면 false */
    pinByUrl: (input: string) => {
      const id = toVideoId(input);
      if (!id) {
        setError("유튜브 주소나 11자리 영상 ID를 넣어 주세요.");
        return false;
      }
      if (view && !pinned.has(id)) run(() => adminApi.curate(productId, lang, { pinnedVideoIds: [...view.pinnedVideoIds, id] }));
      return true;
    },
  };
}
