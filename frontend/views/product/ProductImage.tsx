"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { imageView, isMissingFrame } from "@/lib/productImage";
import styles from "./ProductImage.module.css";

/**
 * 상품 이미지.
 * - 일반 상품 사진: 흰 여백을 두고 잘리지 않게(contain)
 * - 유튜브 영상 장면: 카드를 꽉 채우고 배정된 위치로 자름(cover) → 같은 영상 상품끼리도 이미지가 다름
 * - 이미지가 없으면 상품명 첫 글자
 * priority: 첫 화면의 주인공 이미지(상세 대표 이미지)만 즉시·우선 로드, 나머지는 스크롤할 때 로드
 */
export default function ProductImage({ src, name, dim, priority }: { src: string | null; name: string; dim?: boolean; priority?: boolean }) {
  const view = src ? imageView(src) : null;
  const [current, setCurrent] = useState(view?.src ?? null);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`${styles.frame} ${dim ? styles.dim : ""}`}>
      {view && current && !failed ? (
        <img
          src={current}
          alt={name}
          className={view.frame ? styles.cover : styles.image}
          style={view.frame ? { objectPosition: view.position } : undefined}
          width={600}
          height={600}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={(e) => {
            if (isMissingFrame(e.currentTarget) && view.fallback && current !== view.fallback) setCurrent(view.fallback);
          }}
          onError={() => (view.fallback && current !== view.fallback ? setCurrent(view.fallback) : setFailed(true))}
        />
      ) : (
        <div className={styles.placeholder} aria-label={name}>
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
