/* eslint-disable @next/next/no-img-element */
import styles from "./ProductImage.module.css";

/** 이미지가 없으면 상품명 첫 글자로 기본 이미지 (데모 이미지 저작권 문제 회피) */
export default function ProductImage({ src, name, dim }: { src: string | null; name: string; dim?: boolean }) {
  return (
    <div className={`${styles.frame} ${dim ? styles.dim : ""}`}>
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <div className={styles.placeholder} aria-label={name}>
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
