import type { VideoCollection } from "@/models/types";
import VideoCollectionCard from "./VideoCollectionCard";
import styles from "./VideoCollectionGrid.module.css";

export default function VideoCollectionGrid({ collections }: { collections: VideoCollection[] }) {
  return (
    <ul className={styles.grid}>
      {collections.map((c) => (
        <li key={c.video.videoId}>
          <VideoCollectionCard collection={c} />
        </li>
      ))}
    </ul>
  );
}
