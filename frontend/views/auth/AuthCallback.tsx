"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/controllers/useAuth";
import { useI18n } from "@/controllers/useI18n";
import { takeNext } from "@/lib/auth/returnTo";
import StatusScreen from "@/views/system/StatusScreen";
import { ButtonLink } from "@/views/ui/Button";
import styles from "./Auth.module.css";

/**
 * V — 소셜 로그인에서 돌아오는 곳 (/auth/callback)
 * 백엔드 성공 핸들러: /auth/callback, 실패 핸들러: /auth/callback?error=<code>
 */
export default function AuthCallback() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const refresh = useAuth((s) => s.refresh);
  const [failed, setFailed] = useState<string | null>(params.get("error"));
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || failed) return;
    ran.current = true;
    refresh().then((user) => {
      if (!user) return setFailed("no_session");
      router.replace(takeNext());
      router.refresh();
    });
  }, [failed, refresh, router]);

  if (failed) {
    return (
      <StatusScreen
        title={t.auth.callbackFailedTitle}
        body={failed === "email_conflict" ? t.auth.callbackEmailConflict : t.auth.callbackFailedBody}
        actions={
          <>
            <ButtonLink href="/login">{t.auth.retry}</ButtonLink>
            <ButtonLink href="/" variant="outline">{t.system.home}</ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className={styles.page}>
      <p role="status" className={styles.lead}>{t.auth.callbackLoading}</p>
    </div>
  );
}
