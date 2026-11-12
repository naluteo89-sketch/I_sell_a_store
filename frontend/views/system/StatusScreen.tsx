"use client";

import type { ReactNode } from "react";
import styles from "./StatusScreen.module.css";

/** 404·오류 화면 공통: 막다른 길 없이 항상 다음 행동을 제시 (Vercel: No dead ends) */
export default function StatusScreen({ code, title, body, actions }: { code?: string; title: string; body: string; actions: ReactNode }) {
  return (
    <section className={styles.screen}>
      {code && <p className={styles.code} aria-hidden>{code}</p>}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>{actions}</div>
    </section>
  );
}
