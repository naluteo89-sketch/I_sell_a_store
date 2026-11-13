"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/controllers/useI18n";
import { useQuickView } from "@/controllers/useQuickView";
import { fetchVideos } from "@/models/api/productApi";
import type { Product, Video } from "@/models/types";
import PriceRange from "@/views/product/PriceRange";
import ProductImage from "@/views/product/ProductImage";
import PurchasePanel from "@/views/product/PurchasePanel";
import VideoListItem from "@/views/youtube/VideoListItem";
import YoutubePlayer from "@/views/youtube/YoutubePlayer";
import styles from "./QuickViewSheet.module.css";

/**
 * V — 빠른 보기 시트 (PC: 오른쪽에서, 모바일: 아래에서)
 * 브라우저 기본 <dialog> 를 써서 Esc 닫기·포커스 가두기·닫으면 원래 버튼으로 포커스 복귀가 저절로 된다.
 * 바깥(어두운 배경)을 눌러도 닫히고, 다른 페이지로 이동하면 자동으로 닫힌다.
 */
export default function QuickViewSheet() {
  const { product, close } = useQuickView();
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (product && !d.open) d.showModal();
    if (!product && d.open) d.close();
  }, [product]);

  // 상품 페이지·결제로 이동하면 닫기
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <dialog
      ref={dialog}
      className={styles.sheet}
      aria-labelledby="qv-title"
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {product && <Body key={product.id} product={product} onClose={close} />}
    </dialog>
  );
}

function Body({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, category } = useI18n();
  const categoryName = category(product.categorySlug, product.categoryName);
  return (
    <div className={styles.inner}>
      <div className={styles.top}>
        <p className={styles.kicker}>{t.product.quickView}</p>
        <button type="button" className={styles.close} onClick={onClose} aria-label={t.product.close}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.media}>
        <ProductImage src={product.imageUrl} name={product.name} priority />
      </div>

      <div className={styles.head}>
        {categoryName && <p className={styles.category}>{categoryName}</p>}
        <h2 id="qv-title" className={styles.title} data-font="plain">{product.name}</h2>
        <PriceRange product={product} />
      </div>

      {product.description && <p className={styles.desc}>{product.description}</p>}

      <QuickVideos productId={product.id} />

      <PurchasePanel product={product} />

      <Link href={`/products/${product.id}`} className={styles.full}>
        {t.product.fullPage}
      </Link>
    </div>
  );
}

/** 리뷰 영상 최대 3개. 썸네일만 보여 주고, 누를 때 플레이어를 연다 (유튜브 정책·속도) */
function QuickVideos({ productId }: { productId: number }) {
  const { t, locale } = useI18n();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchVideos(productId, locale)
      .then((v) => alive && setVideos(v.slice(0, 3)))
      .catch(() => alive && setVideos([]));
    return () => {
      alive = false;
    };
  }, [productId, locale]);

  if (videos === null) return <p className={styles.muted} role="status">{t.youtube.loading}</p>;
  if (videos.length === 0) return null;
  const active = videos.find((v) => v.videoId === playing);

  return (
    <section className={styles.videos} aria-label={t.youtube.title}>
      <h3 className={styles.subhead} data-font="plain">{t.youtube.title}</h3>
      {active && <YoutubePlayer video={active} />}
      <ul className={styles.videoList}>
        {videos.map((v) => (
          <VideoListItem key={v.videoId} video={v} active={v.videoId === playing} onPlay={() => setPlaying(v.videoId)} />
        ))}
      </ul>
    </section>
  );
}
