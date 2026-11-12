"use client";

import { useI18n } from "@/controllers/useI18n";
import type { Video } from "@/models/types";
import styles from "./YoutubePlayer.module.css";

/** 유튜브 정책: 최소 200×200, 플레이어 위에 아무것도 겹치지 않음, 출처(Referer) 전달 */
export default function YoutubePlayer({ video }: { video: Video }) {
  const { t } = useI18n();
  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        <iframe
          key={video.videoId}
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
          title={video.title ?? t.youtube.fallbackTitle}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener" className={styles.link}>
        {t.youtube.openOnYoutube}
      </a>
    </div>
  );
}
