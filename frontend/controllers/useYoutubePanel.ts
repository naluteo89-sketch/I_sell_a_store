"use client";

import { useEffect, useState } from "react";
import { fetchVideos } from "@/models/api/productApi";
import type { Video } from "@/models/types";
import { useI18n } from "./useI18n";

/** C — 상품 영상 목록 불러오기 + 재생 중인 영상. 언어를 바꾸면 그 언어 유튜버 영상으로 다시 불러온다 */
export function useYoutubePanel(productId: number) {
  const { locale } = useI18n();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    let alive = true;
    setVideos(null);
    setPlaying(null);
    fetchVideos(productId, locale)
      .then((v) => alive && setVideos(v))
      .catch(() => alive && setVideos([]));
    return () => {
      alive = false;
    };
  }, [productId, locale]);

  return { videos, playing, play: setPlaying };
}
