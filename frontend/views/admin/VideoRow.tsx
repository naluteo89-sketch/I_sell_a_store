/* eslint-disable @next/next/no-img-element */
import type { Video } from "@/models/types";
import { compactViews } from "@/lib/format";
import Button from "@/views/ui/Button";
import { thumbnailOf } from "@/views/youtube/VideoListItem";
import styles from "./VideoRow.module.css";

export default function VideoRow({
  video, pinned, excluded, busy, onPin, onExclude,
}: { video: Video; pinned: boolean; excluded: boolean; busy: boolean; onPin: () => void; onExclude: () => void }) {
  return (
    <li className={`${styles.row} ${excluded ? styles.excluded : ""}`}>
      <img src={thumbnailOf(video)} alt="" className={styles.thumb} />
      <div className={styles.body}>
        <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener" className={styles.title}>
          {video.title ?? video.videoId}
        </a>
        <p className={styles.meta}>
          {video.channelTitle}
          {video.viewCount > 0 && ` · ${compactViews(video.viewCount)}`}
        </p>
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant={pinned ? "primary" : "chip"} disabled={busy} onClick={onPin}>
          {pinned ? "고정됨" : "고정"}
        </Button>
        <Button size="sm" variant="chip" active={excluded} disabled={busy} onClick={onExclude}>
          {excluded ? "제외됨" : "제외"}
        </Button>
      </div>
    </li>
  );
}
