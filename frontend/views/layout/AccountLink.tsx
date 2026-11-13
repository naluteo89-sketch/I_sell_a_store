"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/controllers/useAuth";
import { useI18n } from "@/controllers/useI18n";
import { loginHref } from "@/lib/auth/returnTo";
import styles from "./AccountLink.module.css";

/** 헤더 계정 자리: 로그인 전 [로그인], 로그인 후 이름 첫 글자(또는 사진) → 내 계정 */
export default function AccountLink() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { user, status, ensure } = useAuth();

  useEffect(() => {
    ensure();
  }, [ensure]);

  // 확인 전에는 같은 크기의 빈 자리 — 로그인/계정 버튼이 번갈아 깜빡이지 않게
  if (status === "idle" || (status === "loading" && !user)) {
    return <span className={styles.placeholder} aria-hidden />;
  }

  if (!user) {
    return (
      <Link href={loginHref(pathname)} className={styles.login}>
        {t.nav.login}
      </Link>
    );
  }

  return (
    <Link href="/account" className={styles.account} aria-label={`${t.nav.account}: ${user.nickname}`}
      aria-current={pathname === "/account" ? "page" : undefined}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" width={32} height={32} className={styles.avatar} referrerPolicy="no-referrer" />
      ) : (
        <span className={styles.avatar} aria-hidden>{user.nickname.charAt(0).toUpperCase() || "?"}</span>
      )}
    </Link>
  );
}
