import type { Metadata } from "next";
import { safeNext } from "@/lib/auth/returnTo";
import { getI18n } from "@/lib/i18n/server";
import LoginForm from "@/views/auth/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.loginTitle, robots: { index: false } };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={safeNext(next)} />;
}
