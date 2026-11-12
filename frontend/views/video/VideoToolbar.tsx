"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import { VIDEO_SORTS } from "@/models/api/videoApi";
import type { VideoSort } from "@/models/types";
import styles from "./VideoToolbar.module.css";

export const videosHref = (q: string | undefined, sort: VideoSort) => {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (sort !== "views") qs.set("sort", sort);
  const s = qs.toString();
  return `/videos${s ? `?${s}` : ""}`;
};

/** 유튜버 이름·영상 제목 검색 + 정렬 (영상 조회수순 / 유튜버 인기순 / 최신순). 상태는 모두 주소에 저장 */
export default function VideoToolbar({ q, sort }: { q?: string; sort: VideoSort }) {
  const { t } = useI18n();
  return (
    <div className={styles.toolbar}>
      <form action="/videos" role="search" className={styles.search}>
        {sort !== "views" && <input type="hidden" name="sort" value={sort} />}
        <input type="search" name="q" defaultValue={q} placeholder={t.videos.searchPlaceholder} aria-label={t.videos.searchPlaceholder}
          className={styles.input} />
      </form>
      <div className={styles.sortWrap}>
        <div className={styles.sorts} role="group" aria-label={t.list.sortLabel}>
          {VIDEO_SORTS.map((s) => (
            <Link key={s} href={videosHref(q, s)} className={s === sort ? styles.sortActive : styles.sort} aria-current={s === sort ? "true" : undefined}>
              {t.videos.sorts[s]}
            </Link>
          ))}
        </div>
        {sort === "channelViews" && <p className={styles.hint}>{t.videos.sortHint}</p>}
      </div>
    </div>
  );
}
