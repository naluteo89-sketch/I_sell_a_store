"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { isTypingTarget, usePagerStore } from "@/controllers/usePager";
import { useI18n } from "@/controllers/useI18n";
import styles from "./PagedResults.module.css";

const pageHref = (base: string, p: number) => (p <= 1 ? base || "?" : `${base}${base.includes("?") ? "&" : "?"}page=${p}`);

/**
 * 페이지가 있는 목록 (상품·영상 공통)
 * - 화면 양옆 큰 ‹ › 버튼 + 아래 [이전 · 번호 · 다음] + 키보드 ← →
 * - 넘기면: 넘긴 방향에서 목록이 밀려 들어오고, 위에 "2페이지" 배지가 잠깐 뜨고, 목록 맨 위로 이동
 * - 전체 페이지 수는 보여 주지 않는다 (쇼핑몰 상품 규모 비공개)
 */
export default function PagedResults({ page, totalPages, baseHref, children }: {
  page: number;
  totalPages: number;
  baseHref: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const top = useRef<HTMLDivElement>(null);
  const { direction, lastPage, go, seen } = usePagerStore();
  const [badge, setBadge] = useState(false);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const move = (to: number) => {
    if (to < 1 || to > totalPages || to === page) return;
    go(page, to);
    router.push(pageHref(baseHref, to), { scroll: false });
  };

  // 페이지가 바뀌어 새 목록이 그려지면: 배지 표시 + 목록 맨 위로
  useEffect(() => {
    if (lastPage !== null && lastPage !== page) {
      setBadge(true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      top.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      const timer = window.setTimeout(() => setBadge(false), 1800);
      seen(page);
      return () => window.clearTimeout(timer);
    }
    seen(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 키보드 ← → (입력 중·조합키·시트가 열려 있을 땐 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTypingTarget(e.target)) return;
      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        move(page - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        move(page + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, baseHref]);

  if (totalPages <= 1) return <>{children}</>;

  // 전체 페이지 수(=상품 규모)가 드러나지 않게 지금 페이지 앞뒤만 보여 준다 (마지막 번호 숨김)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2);
  const enter = direction === 1 ? styles.fromRight : direction === -1 ? styles.fromLeft : "";

  return (
    <div className={styles.wrap}>
      <div ref={top} className={styles.anchor} />

      {/* 페이지가 바뀐 걸 한눈에: 잠깐 떴다 사라지는 배지 (화면낭독기에는 문장으로 알림) */}
      <p className={`${styles.badge} ${badge ? styles.badgeOn : ""}`} aria-hidden>
        {t.pager.badge(page)}
      </p>
      <p className="sr-only" aria-live="polite">{lastPage !== null ? t.pager.status(page) : ""}</p>

      {/* 넓은 화면: 목록 양옆에 떠 있는 큰 화살표 */}
      <SideArrow dir="prev" disabled={!hasPrev} label={t.pager.prev} onClick={() => move(page - 1)} />
      <SideArrow dir="next" disabled={!hasNext} label={t.pager.next} onClick={() => move(page + 1)} />

      <div key={page} className={`${styles.content} ${enter}`}>
        {children}
      </div>

      <nav className={styles.pager} aria-label={t.common.pagination}>
        <button type="button" className={styles.step} onClick={() => move(page - 1)} disabled={!hasPrev}>
          <Chevron dir="prev" /> {t.pager.prev}
        </button>
        <div className={styles.numbers}>
          {pages.map((p, i) => (
            <span key={p} className={styles.group}>
              <Link href={pageHref(baseHref, p)} scroll={false} onClick={() => go(page, p)}
                className={p === page ? styles.current : styles.page} aria-current={p === page ? "page" : undefined}
                aria-label={t.pager.goTo(p)}>
                {p}
              </Link>
            </span>
          ))}
        </div>
        <button type="button" className={styles.step} onClick={() => move(page + 1)} disabled={!hasNext}>
          {t.pager.next} <Chevron dir="next" />
        </button>
      </nav>
      <p className={styles.hint} aria-hidden>{t.pager.keyHint}</p>
    </div>
  );
}

function SideArrow({ dir, disabled, label, onClick }: { dir: "prev" | "next"; disabled: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.side} ${dir === "prev" ? styles.sidePrev : styles.sideNext}`}
      onClick={onClick} disabled={disabled} aria-label={label} tabIndex={-1}>
      <Chevron dir={dir} size={22} />
    </button>
  );
}

function Chevron({ dir, size = 14 }: { dir: "prev" | "next"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d={dir === "prev" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
