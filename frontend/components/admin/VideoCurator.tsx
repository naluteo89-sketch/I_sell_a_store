/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminVideoView, type Video } from "@/lib/api";
import { compactViews } from "@/lib/format";

/** 유튜브 주소 또는 영상 ID에서 11자리 ID만 뽑는다 */
function toVideoId(input: string): string | null {
  const s = input.trim();
  const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(s) ? s : null;
}

export default function VideoCurator({ productId }: { productId: number }) {
  const [view, setView] = useState<AdminVideoView | null>(null);
  const [busy, setBusy] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setView(await adminApi.videos(productId));
    } catch {
      setError("영상 정보를 불러오지 못했습니다.");
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!view) return <p className="text-sm text-gray-400">영상 정보를 불러오는 중…</p>;

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

  const pinned = new Set(view.pinnedVideoIds);
  const excluded = new Set(view.excludedVideoIds);

  const togglePin = (id: string) => {
    const next = pinned.has(id) ? view.pinnedVideoIds.filter((x) => x !== id) : [...view.pinnedVideoIds, id];
    run(() => adminApi.curate(productId, { pinnedVideoIds: next }));
  };

  const toggleExclude = (id: string) => {
    const next = excluded.has(id) ? view.excludedVideoIds.filter((x) => x !== id) : [...view.excludedVideoIds, id];
    run(() => adminApi.curate(productId, { excludedVideoIds: next }));
  };

  const addPinned = () => {
    const id = toVideoId(addInput);
    if (!id) {
      setError("유튜브 주소나 11자리 영상 ID를 넣어 주세요.");
      return;
    }
    setAddInput("");
    if (!pinned.has(id)) run(() => adminApi.curate(productId, { pinnedVideoIds: [...view.pinnedVideoIds, id] }));
  };

  // 검색 결과에 없는 고정 영상도 목록에 보이도록 합친다
  const searchIds = new Set(view.searchResults.map((v) => v.videoId));
  const rows: Video[] = [
    ...view.pinnedVideoIds
      .filter((id) => !searchIds.has(id))
      .map((id) => ({ videoId: id, title: null, channelTitle: null, thumbnailUrl: null, viewCount: 0 })),
    ...view.searchResults,
  ];

  return (
    <div className="space-y-4 rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">유튜브 영상</h2>
          <p className="text-xs text-gray-500">
            검색어 "{view.keyword}" ·{" "}
            {view.fetchedAt ? `마지막 검색 ${new Date(view.fetchedAt).toLocaleString("ko-KR")}` : "아직 검색 안 함"}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || !view.apiKeyConfigured}
          onClick={() => run(() => adminApi.refreshVideos(productId))}
          className="shrink-0 rounded-full border px-3 py-1 text-xs disabled:opacity-40"
          title="유튜브 검색 1회(하루 기본 100회 중)를 사용합니다"
        >
          다시 검색
        </button>
      </div>

      {!view.apiKeyConfigured && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          YOUTUBE_API_KEY가 설정되지 않아 검색할 수 없습니다. 영상 주소를 직접 고정하는 것은 가능합니다.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={view.hidden}
          onChange={(e) => run(() => adminApi.curate(productId, { hidden: e.target.checked }))}
        />
        이 상품은 영상 패널 숨기기
      </label>

      <div className="flex gap-2">
        <input
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          placeholder="고정할 영상 주소 또는 ID"
          className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
        />
        <button type="button" onClick={addPinned} disabled={busy} className="rounded-lg bg-brand px-3 text-sm text-white">
          고정
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="space-y-2">
        {rows.length === 0 && <li className="py-6 text-center text-sm text-gray-400">영상이 없습니다.</li>}
        {rows.map((v) => {
          const isPinned = pinned.has(v.videoId);
          const isExcluded = excluded.has(v.videoId);
          return (
            <li key={v.videoId} className={`flex gap-3 rounded-lg p-2 ${isExcluded ? "opacity-40" : ""}`}>
              <img
                src={v.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}
                alt=""
                className="h-[54px] w-[96px] shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <a
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noopener"
                  className="line-clamp-2 text-sm hover:underline"
                >
                  {v.title ?? v.videoId}
                </a>
                <p className="text-xs text-gray-500">
                  {v.channelTitle}
                  {v.viewCount > 0 && ` · ${compactViews(v.viewCount)}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => togglePin(v.videoId)}
                  className={`rounded-full px-2 py-0.5 text-xs ${isPinned ? "bg-brand text-white" : "border"}`}
                >
                  {isPinned ? "고정됨" : "고정"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleExclude(v.videoId)}
                  className={`rounded-full px-2 py-0.5 text-xs ${isExcluded ? "bg-gray-700 text-white" : "border"}`}
                >
                  {isExcluded ? "제외됨" : "제외"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-gray-400">
        쇼핑몰에는 고정 영상 → 검색 결과 순으로 보이고, 제외한 영상은 빠집니다. (현재 노출 {view.displayed.length}개)
      </p>
    </div>
  );
}
