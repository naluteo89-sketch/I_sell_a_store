"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import type { Video } from "@/models/types";
import styles from "./VideoListItem.module.css";

export const thumbnailOf = (v: Video) => v.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

/** 영상 한 줄: 썸네일 전체가 [실행하기] 버튼 */
export default function VideoListItem({ video, active, onPlay }: { video: Video; active: boolean; onPlay: () => void }) {
  const { t, views } = useI18n();
  const title = video.title ?? t.youtube.fallbackTitle;
  return (
    <li className={`${styles.item} ${active ? styles.active : ""}`}>
      <button type="button" className={styles.thumbButton} onClick={onPlay} disabled={active}
        aria-label={`${active ? t.youtube.playing : t.youtube.play}: ${title}`}>
        <img src={thumbnailOf(video)} alt="" className={styles.thumb} width={128} height={72} loading="lazy" decoding="async" />
        <span className={styles.playBadge} aria-hidden>
          {active ? (
            <span className={styles.bars}><i /><i /><i /></span>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M1 1.2v9.6c0 .6.7 1 1.2.6l7-4.8c.4-.3.4-.9 0-1.2l-7-4.8C1.7.2 1 .6 1 1.2Z" />
            </svg>
          )}
        </span>
      </button>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.meta}>
          {video.channelTitle}
          {video.viewCount > 0 && <span className={styles.views}>{t.youtube.views(views(video.viewCount))}</span>}
        </p>
        <div className={styles.actions}>
          <button type="button" className={active ? styles.playingLabel : styles.playLabel} onClick={onPlay} disabled={active}>
            {active ? t.youtube.playing : t.youtube.play}
          </button>
          {/* 같은 영상에 상품이 여러 개면 모아보기로 */}
          {(video.productCount ?? 0) > 1 && (
            <Link href={`/videos/${video.videoId}`} className={styles.collection}>
              {t.videos.seeAll(video.productCount ?? 0)}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
