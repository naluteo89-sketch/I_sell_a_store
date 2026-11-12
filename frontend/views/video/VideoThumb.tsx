"use client";
/* eslint-disable @next/next/no-img-element */
import { thumbnailOf } from "@/views/youtube/VideoListItem";
import type { Video } from "@/models/types";
import styles from "./VideoThumb.module.css";

/** 16:9 둥근 썸네일 + 재생 표시 (장식) */
export default function VideoThumb({ video, priority }: { video: Video; priority?: boolean }) {
  return (
    <div className={styles.thumb}>
      <img src={thumbnailOf(video)} alt="" width={480} height={270} loading={priority ? "eager" : "lazy"} decoding="async" />
      <span className={styles.play} aria-hidden>
        <svg width="14" height="16" viewBox="0 0 10 12" fill="currentColor">
          <path d="M1 1.2v9.6c0 .6.7 1 1.2.6l7-4.8c.4-.3.4-.9 0-1.2l-7-4.8C1.7.2 1 .6 1 1.2Z" />
        </svg>
      </span>
    </div>
  );
}
