/* eslint-disable @next/next/no-img-element */
import type { Video } from "@/models/types";
import { compactViews } from "@/lib/format";
import Button from "@/views/ui/Button";
import styles from "./VideoListItem.module.css";

export const thumbnailOf = (v: Video) => v.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

export default function VideoListItem({ video, active, onPlay }: { video: Video; active: boolean; onPlay: () => void }) {
  return (
    <li className={`${styles.item} ${active ? styles.active : ""}`}>
      <img src={thumbnailOf(video)} alt="" className={styles.thumb} />
      <div className={styles.body}>
        <p className={styles.title}>{video.title ?? "YouTube 영상"}</p>
        <p className={styles.meta}>
          {video.channelTitle}
          {video.viewCount > 0 && ` · 조회수 ${compactViews(video.viewCount)}`}
        </p>
        <Button size="sm" className={styles.play} disabled={active} onClick={onPlay}>
          {active ? "재생 중" : "실행하기"}
        </Button>
      </div>
    </li>
  );
}
