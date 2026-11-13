import styles from "./ProductGridSkeleton.module.css";

/** 상품을 불러오는 동안 같은 격자 모양을 먼저 보여 준다 (화면이 덜 흔들림). 0.2초 안에 끝나면 보이지 않는다 */
export default function ProductGridSkeleton({ count = 8, label }: { count?: number; label: string }) {
  return (
    <div className={styles.grid} aria-busy="true" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.image} />
          <div className={styles.line} />
          <div className={styles.lineShort} />
        </div>
      ))}
    </div>
  );
}
