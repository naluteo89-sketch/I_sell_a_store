"use client";

import Link from "next/link";
import { useState } from "react";
import { canQuickAdd, useBulkAdd } from "@/controllers/useBulkAdd";
import { useI18n } from "@/controllers/useI18n";
import type { VideoCollection } from "@/models/types";
import ProductCard from "@/views/product/ProductCard";
import Button, { ButtonLink } from "@/views/ui/Button";
import YoutubePlayer from "@/views/youtube/YoutubePlayer";
import VideoThumb from "./VideoThumb";
import styles from "./VideoCollectionView.module.css";

/**
 * V — 리뷰 영상 하나 + 그 영상에 나온 상품 모아보기 + 한번에 담기
 * 플레이어는 누르기 전까지 불러오지 않는다 (유튜브 정책·성능)
 */
export default function VideoCollectionView({ collection }: { collection: VideoCollection }) {
  const { t, views } = useI18n();
  const { video, products } = collection;
  const [playing, setPlaying] = useState(false);
  const b = useBulkAdd(products);
  const selectedCount = b.eligible.filter((p) => b.isSelected(p.id)).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.media}>
          {playing ? (
            <YoutubePlayer video={video} />
          ) : (
            <button type="button" className={styles.poster} onClick={() => setPlaying(true)} aria-label={`${t.videos.play}: ${video.title ?? ""}`}>
              <VideoThumb video={video} priority />
            </button>
          )}
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{video.title ?? t.youtube.fallbackTitle}</h1>
          <p className={styles.channel}>
            <Link href={`/videos?q=${encodeURIComponent(video.channelTitle ?? "")}`} translate="no">
              {video.channelTitle}
            </Link>
          </p>
          <ul className={styles.stats}>
            {video.viewCount > 0 && <li>{t.youtube.views(views(video.viewCount))}</li>}
            {!!video.channelViewCount && <li>{t.videos.channelViews(views(video.channelViewCount))}</li>}
          </ul>
          <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener" className={styles.external}>
            {t.youtube.openOnYoutube}
          </a>
        </div>
      </section>

      <section className={styles.products} aria-labelledby="in-video">
        <div className={styles.bar}>
          <h2 id="in-video" className={styles.h2}>{t.videos.inThisVideo(products.length)}</h2>
          {b.eligible.length > 0 && (
            <div className={styles.bulk}>
              <label className={styles.selectAll}>
                <input type="checkbox" checked={b.allSelected} onChange={b.toggleAll} />
                {t.videos.selectAll}
                <span className={styles.selectedCount}>{t.videos.selectedCount(selectedCount)}</span>
              </label>
              <Button variant="outline" onClick={b.addSelected}>{t.videos.addSelected(selectedCount)}</Button>
              <Button onClick={b.addAll}>{t.videos.addAll}</Button>
            </div>
          )}
        </div>

        <div className={styles.status} role="status" aria-live="polite">
          {b.warn && <p className={styles.warn}>{t.videos.nothingSelected}</p>}
          {b.result && (
            <div className={styles.ok}>
              <p>
                {t.videos.added(b.result.added)}
                {b.result.needsOptions > 0 && <> {t.videos.needsOptions(b.result.needsOptions)}</>}
              </p>
              <ButtonLink href="/cart" size="sm">{t.videos.goCart}</ButtonLink>
            </div>
          )}
        </div>

        <ul className={styles.grid}>
          {products.map((p) => {
            const quick = canQuickAdd(p);
            return (
              <li key={p.id} className={styles.item}>
                <ProductCard product={p} />
                {quick ? (
                  // 카드 링크 안에 넣지 않고 형제 요소로 겹쳐 둔다 (링크 안 체크박스는 접근성 위반)
                  <label className={b.isSelected(p.id) ? styles.pickOn : styles.pick}>
                    <input type="checkbox" checked={b.isSelected(p.id)} onChange={() => b.toggle(p.id)} />
                    <span className="sr-only">{t.videos.select(p.name)}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="m3 7.5 2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </label>
                ) : (
                  p.stock > 0 && <span className={styles.optionBadge}>{t.videos.optionBadge}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
