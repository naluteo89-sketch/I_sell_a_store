/* eslint-disable @next/next/no-img-element */
import styles from "./ProductImage.module.css";

/** 이미지가 없으면 상품명 첫 글자로 기본 이미지 (데모 이미지 저작권 문제 회피) */
/** priority: 첫 화면의 주인공 이미지(상세 대표 이미지)만 즉시·우선 로드, 나머지는 스크롤할 때 로드 */
export default function ProductImage({ src, name, dim, priority }: { src: string | null; name: string; dim?: boolean; priority?: boolean }) {
  return (
    <div className={`${styles.frame} ${dim ? styles.dim : ""}`}>
      {src ? (
        <img src={src} alt={name} className={styles.image} width={600} height={600}
          loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} />
      ) : (
        <div className={styles.placeholder} aria-label={name}>
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
