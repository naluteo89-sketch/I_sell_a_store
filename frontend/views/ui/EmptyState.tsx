import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

export default function EmptyState({ children, action, dashed }: { children: ReactNode; action?: ReactNode; dashed?: boolean }) {
  return (
    <div className={`${styles.empty} ${dashed ? styles.dashed : ""}`}>
      <p>{children}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
