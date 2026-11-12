/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { fetchVideos, type Video } from "@/lib/api";
import { compactViews } from "@/lib/format";

/**
 * 상품 상세 옆 유튜브 영상 패널.
 * - 목록은 백엔드 캐시에서만 읽는다 (방문자 조회로 유튜브 검색 할당량을 쓰지 않음)
 * - [실행하기]를 누르기 전에는 플레이어를 불러오지 않는다 (속도 + 누르기 전 유튜브로 데이터 전송 없음)
 * - 플레이어 위에 아무것도 겹치지 않고, 최소 200x200 이상 크기를 유지한다 (유튜브 정책)
 */
export default function YoutubePanel({ productId }: { productId: number }) {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos(productId)
      .then(setVideos)
      .catch(() => setVideos([]));
  }, [productId]);

  const thumb = (v: Video) => v.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

  return (
    <aside className="rounded-2xl border bg-white p-4 lg:sticky lg:top-20">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">관련 영상</h2>
        <span className="text-xs text-gray-400">YouTube</span>
      </div>

      {playing && (
        <div className="mb-4">
          <div className="aspect-video min-h-[200px] w-full overflow-hidden rounded-lg bg-black">
            <iframe
              key={playing.videoId}
              src={`https://www.youtube.com/embed/${playing.videoId}?autoplay=1&rel=0`}
              title={playing.title ?? "YouTube 영상"}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${playing.videoId}`}
            target="_blank"
            rel="noopener"
            className="mt-2 inline-block text-xs text-gray-500 underline"
          >
            YouTube에서 보기
          </a>
        </div>
      )}

      {videos === null && <p className="py-8 text-center text-sm text-gray-400">영상을 불러오는 중…</p>}

      {videos?.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">아직 연결된 영상이 없습니다.</p>
      )}

      <ul className="space-y-3">
        {videos?.map((v) => {
          const active = playing?.videoId === v.videoId;
          return (
            <li key={v.videoId} className={`flex gap-3 rounded-lg p-2 ${active ? "bg-gray-100" : ""}`}>
              <img src={thumb(v)} alt="" className="h-[68px] w-[120px] shrink-0 rounded-md object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{v.title ?? "YouTube 영상"}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {v.channelTitle}
                  {v.viewCount > 0 && ` · 조회수 ${compactViews(v.viewCount)}`}
                </p>
                <button
                  type="button"
                  onClick={() => setPlaying(v)}
                  className="mt-auto self-start rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  disabled={active}
                >
                  {active ? "재생 중" : "실행하기"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
