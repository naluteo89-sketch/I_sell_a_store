"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import { BOARDS } from "@/models/api/communityApi";
import type { CommunityBoard } from "@/models/types";
import styles from "./BoardTabs.module.css";

export const boardHref = (board?: CommunityBoard, page = 1) => {
  const qs = new URLSearchParams();
  if (board) qs.set("board", board);
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return `/community${s ? `?${s}` : ""}`;
};

export default function BoardTabs({ current }: { current?: CommunityBoard }) {
  const { t } = useI18n();
  return (
    <nav className={styles.tabs} aria-label={t.community.board}>
      <Link href={boardHref()} className={!current ? styles.active : styles.tab} aria-current={!current ? "page" : undefined}>
        {t.community.boards.all}
      </Link>
      {BOARDS.map((b) => (
        <Link key={b} href={boardHref(b)} className={current === b ? styles.active : styles.tab}
          aria-current={current === b ? "page" : undefined}>
          {t.community.boards[b]}
        </Link>
      ))}
    </nav>
  );
}
