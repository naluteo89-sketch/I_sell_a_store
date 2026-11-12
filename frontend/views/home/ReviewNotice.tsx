"use client";

import { useI18n } from "@/controllers/useI18n";
import styles from "./ReviewNotice.module.css";

export default function ReviewNotice() {
  const { t } = useI18n();
  return (
    <div className={styles.notice}>
      <span className={styles.icon} aria-hidden>
        <svg width="14" height="16" viewBox="0 0 10 12" fill="currentColor">
          <path d="M1 1.2v9.6c0 .6.7 1 1.2.6l7-4.8c.4-.3.4-.9 0-1.2l-7-4.8C1.7.2 1 .6 1 1.2Z" />
        </svg>
      </span>
      <div>
        <p className={styles.title}>{t.home.reviewTitle}</p>
        <p className={styles.body}>{t.home.reviewBody}</p>
      </div>
    </div>
  );
}
