"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import FrameImg from "@/views/ui/FrameImg";
import { useI18n } from "@/controllers/useI18n";
import type { VideoCollection } from "@/models/types";
import VideoThumb from "./VideoThumb";
import styles from "./VideoCollectionCard.module.css";

/** 영상 카드: 썸네일 + 제목 + 그 영상에 나온 상품 미리보기 */
export default function VideoCollectionCard({ collection }: { collection: VideoCollection }) {
  const { t, views } = useI18n();
  const { video, productCount, products } = collection;
  const preview = products.slice(0, 4);
  return (
    <Link href={`/videos/${video.videoId}`} className={styles.card}>
      <VideoThumb video={video} />
      <div className={styles.body}>
        <p className={styles.title}>{video.title ?? t.youtube.fallbackTitle}</p>
        <p className={styles.meta}>
          <span translate="no">{video.channelTitle}</span>
          {video.viewCount > 0 && <span>{t.youtube.views(views(video.viewCount))}</span>}
        </p>
        <div className={styles.products}>
          <span className={styles.stack} aria-hidden>
            {preview.map((p) => (
              <span key={p.id} className={styles.dot}>
                {p.imageUrl ? <FrameImg url={p.imageUrl} alt="" width={36} height={36} loading="lazy" /> : p.name.slice(0, 1)}
              </span>
            ))}
          </span>
          <span className={styles.count}>{t.videos.productCount(productCount)}</span>
        </div>
      </div>
    </Link>
  );
}
