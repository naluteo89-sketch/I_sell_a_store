"use client";

import { useEffect, useState } from "react";
import { fetchVideos } from "@/models/api/productApi";
import type { Video } from "@/models/types";

/** C — 상품 영상 목록 불러오기 + 재생 중인 영상 */
export function useYoutubePanel(productId: number) {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    let alive = true;
    setVideos(null);
    setPlaying(null);
    fetchVideos(productId)
      .then((v) => alive && setVideos(v))
      .catch(() => alive && setVideos([]));
    return () => {
      alive = false;
    };
  }, [productId]);

  return { videos, playing, play: setPlaying };
}
