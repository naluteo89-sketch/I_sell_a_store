"use client";

import { useEffect } from "react";
import { useI18n } from "@/controllers/useI18n";
import StatusScreen from "@/views/system/StatusScreen";
import Button, { ButtonLink } from "@/views/ui/Button";

/** 화면 렌더링 중 오류: 다시 시도 / 홈으로 (Next.js error boundary) */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <StatusScreen
      title={t.system.errorTitle}
      body={t.system.errorBody}
      actions={
        <>
          <Button onClick={reset}>{t.system.retry}</Button>
          <ButtonLink href="/" variant="outline">{t.system.home}</ButtonLink>
        </>
      }
    />
  );
}
