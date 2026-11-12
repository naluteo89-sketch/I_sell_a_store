import type { ReactNode } from "react";
import styles from "./Section.module.css";

/** 제목 + 내용 블록 */
export default function Section({ title, sub, children, aside }: { title?: ReactNode; sub?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section}>
      {(title || aside) && (
        <div className={styles.head}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {sub && <p className={styles.sub}>{sub}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
