import type { Metadata } from "next";
import { Suspense } from "react";
import { getI18n } from "@/lib/i18n/server";
import AuthCallback from "@/views/auth/AuthCallback";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.loginTitle, robots: { index: false } };
}

/** useSearchParams 를 쓰는 화면은 Suspense 안에 둔다 (Next.js 15 빌드 규칙) */
export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}
