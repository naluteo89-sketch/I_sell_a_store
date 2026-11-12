import type { ReactNode } from "react";
import styles from "./Card.module.css";

/** 테두리 상자 */
export default function Card({ title, children, sticky }: { title?: ReactNode; children: ReactNode; sticky?: boolean }) {
  return (
    <div className={`${styles.card} ${sticky ? styles.sticky : ""}`}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </div>
  );
}
