import styles from "./Gimme.module.css";

/**
 * "Give it to me" 장바구니 아이콘 (직접 그린 원본).
 * 작은 상자(.drop)가 카트 위에 떠 있다가, 부모([data-gimme-host])에 마우스를 올리면 카트 안으로 떨어진다.
 */
export default function GimmeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={styles.icon}>
      <rect className={styles.drop} x="10.6" y="1.6" width="5.2" height="4.6" rx="1.3" />
      <path d="M2.6 5.2h2c.5 0 .9.3 1 .8l1.7 8.3c.1.5.5.8 1 .8h8.8c.5 0 .9-.3 1-.8l1.4-6.1H6.4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.6" cy="19.2" r="1.45" fill="currentColor" />
      <circle cx="16.9" cy="19.2" r="1.45" fill="currentColor" />
    </svg>
  );
}
