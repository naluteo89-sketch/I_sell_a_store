"use client";
/* eslint-disable @next/next/no-img-element */
import { useI18n } from "@/controllers/useI18n";
import FrameImg from "@/views/ui/FrameImg";
import type { Product } from "@/models/types";
import { ButtonLink } from "@/views/ui/Button";
import styles from "./HeroBanner.module.css";

/**
 * 홈 첫 화면: 왼쪽 브랜드 문구, 오른쪽 실제 상품 이미지가 둥근 타일로 겹친 구성.
 * 작은 "리뷰 영상" 캡슐로 이 쇼핑몰의 핵심(상품 옆 유튜브 리뷰)을 보여준다.
 */
export default function HeroBanner({ title, tagline, products }: { title: string; tagline?: string; products: Product[] }) {
  const { t } = useI18n();
  const picks = products.filter((p) => p.imageUrl).slice(0, 3);
  const tiles = picks.length > 0 ? picks : products.slice(0, 3);

  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.tagline}>{tagline || t.home.heroFallback}</p>
        <div className={styles.actions}>
          <ButtonLink href="/products" size="lg">
            {t.home.browseAll}
          </ButtonLink>
          <ButtonLink href="/community" size="lg" variant="outline">
            {t.nav.community}
          </ButtonLink>
        </div>
      </div>

      <div className={styles.collage} aria-hidden>
        {[0, 1, 2].map((i) => {
          const p = tiles[i];
          return (
            <div key={i} className={`${styles.tile} ${styles[`tile${i}`]}`}>
              {p?.imageUrl ? (
                <FrameImg url={p.imageUrl} alt="" width={400} height={400} fetchPriority={i === 0 ? "high" : "auto"} decoding="async" />
              ) : (
                <span>{p?.name.slice(0, 1) ?? ""}</span>
              )}
            </div>
          );
        })}
        <div className={styles.videoPill}>
          <span className={styles.playDot}>
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M1 1.2v9.6c0 .6.7 1 1.2.6l7-4.8c.4-.3.4-.9 0-1.2l-7-4.8C1.7.2 1 .6 1 1.2Z" />
            </svg>
          </span>
          {t.youtube.title}
        </div>
      </div>
    </section>
  );
}
