import styles from "./loading.module.css";

/**
 * 페이지 이동 중 표시. 0.3초 안에 끝나는 이동에서는 아예 보이지 않게 지연시킨다
 * (Vercel: show-delay ~150–300ms). 실제 내용과 같은 상품 격자 모양이라 화면이 덜 흔들린다.
 */
export default function Loading() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className={styles.title} />
      <div className={styles.grid}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={styles.card} />
        ))}
      </div>
    </div>
  );
}
