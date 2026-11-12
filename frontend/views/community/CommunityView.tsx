"use client";

import { useCommunityList } from "@/controllers/useCommunity";
import { useI18n } from "@/controllers/useI18n";
import type { CommunityBoard } from "@/models/types";
import Button, { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import BoardTabs, { boardHref } from "./BoardTabs";
import Pagination from "./Pagination";
import PostCard from "./PostCard";
import styles from "./CommunityView.module.css";

/** V — 커뮤니티 목록 */
export default function CommunityView({ board, page }: { board?: CommunityBoard; page: number }) {
  const { t } = useI18n();
  const { data, state, reload } = useCommunityList({ board, page });

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>{t.community.title}</h1>
          <p className={styles.desc}>{t.community.desc}</p>
        </div>
        <ButtonLink href={board ? `/community/write?board=${board}` : "/community/write"} size="lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {t.community.write}
        </ButtonLink>
      </header>

      <div className={styles.bar}>
        <BoardTabs current={board} />
      </div>

      {state === "error" && (
        <EmptyState dashed action={<Button variant="outline" onClick={reload}>{t.community.retry}</Button>}>
          {t.community.loadFailed}
        </EmptyState>
      )}

      {state === "loading" && !data && (
        <ul className={styles.list} aria-busy>
          {[0, 1, 2].map((i) => (
            <li key={i} className={styles.skeleton} />
          ))}
        </ul>
      )}

      {data && data.items.length === 0 && (
        <EmptyState dashed action={<ButtonLink href="/community/write">{t.community.write}</ButtonLink>}>{t.community.empty}</EmptyState>
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className={`${styles.list} ${state === "loading" ? styles.dim : ""}`}>
            {data.items.map((p) => (
              <li key={p.id}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} hrefFor={(p) => boardHref(board, p)} />
        </>
      )}
    </div>
  );
}
