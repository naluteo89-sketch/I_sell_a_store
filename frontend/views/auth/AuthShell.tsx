import type { ReactNode } from "react";
import styles from "./Auth.module.css";

/** V — 로그인·가입 화면 공통 틀: 가운데 카드 하나, 제목·한 줄 설명·본문·하단 전환 링크 */
export default function AuthShell({ title, lead, children, footer }: {
  title: string;
  lead: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="auth-title">
        <header className={styles.head}>
          <h1 id="auth-title" className={styles.title}>{title}</h1>
          <p className={styles.lead}>{lead}</p>
        </header>
        {children}
      </section>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
