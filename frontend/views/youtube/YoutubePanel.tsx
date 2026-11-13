"use client";

import { useI18n } from "@/controllers/useI18n";
import { useYoutubePanel } from "@/controllers/useYoutubePanel";
import VideoListItem from "./VideoListItem";
import YoutubePlayer from "./YoutubePlayer";
import styles from "./YoutubePanel.module.css";

/**
 * V — 상품 상세 옆 유튜브 영상 패널.
 * - 목록은 백엔드 DB에서만 읽는다 (방문자 조회로 유튜브 검색 할당량을 쓰지 않음)
 * - [실행하기]를 누르기 전에는 플레이어를 불러오지 않는다
 */
export default function YoutubePanel({ productId }: { productId: number }) {
  const { videos, playing, play } = useYoutubePanel(productId);
  const { t } = useI18n();

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <h2 className={styles.title} data-font="plain">{t.youtube.title}</h2>
        <span className={styles.source}>
          <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
            <rect width="16" height="12" rx="4" fill="currentColor" />
            <path d="M6.5 3.5v5l4-2.5-4-2.5Z" fill="#fff" />
          </svg>
          YouTube
        </span>
      </div>

      {playing && <YoutubePlayer video={playing} />}

      {videos === null && <p className={styles.message}>{t.youtube.loading}</p>}
      {videos?.length === 0 && <p className={styles.message}>{t.youtube.empty}</p>}

      <ul className={styles.list}>
        {videos?.map((v) => (
          <VideoListItem key={v.videoId} video={v} active={playing?.videoId === v.videoId} onPlay={() => play(v)} />
        ))}
      </ul>
    </aside>
  );
}
