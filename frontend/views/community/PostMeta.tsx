"use client";

import { useI18n } from "@/controllers/useI18n";
import styles from "./PostMeta.module.css";

/** 작성자 아바타(첫 글자) + 시간 + 숫자들 */
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  // 이름으로 고정된 부드러운 색 (같은 사람은 늘 같은 색)
  const hue = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);
  return (
    <span className={styles.avatar} style={{ width: size, height: size, background: `hsl(${hue} 55% 92%)`, color: `hsl(${hue} 35% 35%)` }} aria-hidden>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function PostMeta({
  author, createdAt, commentCount, likeCount, viewCount,
}: { author: string; createdAt: string; commentCount?: number; likeCount?: number; viewCount?: number }) {
  const { t, relative, date } = useI18n();
  return (
    <div className={styles.meta}>
      <Avatar name={author} size={26} />
      <span className={styles.author}>{author}</span>
      <time dateTime={createdAt} title={date(createdAt)}>{relative(createdAt)}</time>
      <span className={styles.counts}>
        {commentCount !== undefined && <span>{t.community.comments(commentCount)}</span>}
        {likeCount !== undefined && <span>{t.community.likes(likeCount)}</span>}
        {viewCount !== undefined && <span>{t.community.views(viewCount)}</span>}
      </span>
    </div>
  );
}
