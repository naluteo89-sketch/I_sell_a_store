"use client";

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

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <h2 className={styles.title}>관련 영상</h2>
        <span className={styles.source}>YouTube</span>
      </div>

      {playing && <YoutubePlayer video={playing} />}

      {videos === null && <p className={styles.message}>영상을 불러오는 중…</p>}
      {videos?.length === 0 && <p className={styles.message}>아직 연결된 영상이 없습니다.</p>}

      <ul className={styles.list}>
        {videos?.map((v) => (
          <VideoListItem key={v.videoId} video={v} active={playing?.videoId === v.videoId} onPlay={() => play(v)} />
        ))}
      </ul>
    </aside>
  );
}
