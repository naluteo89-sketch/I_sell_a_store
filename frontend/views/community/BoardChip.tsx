"use client";

import { useI18n } from "@/controllers/useI18n";
import type { CommunityBoard } from "@/models/types";
import styles from "./BoardChip.module.css";

export default function BoardChip({ board }: { board: CommunityBoard }) {
  const { t } = useI18n();
  return <span className={`${styles.chip} ${styles[board]}`}>{t.community.boards[board]}</span>;
}
