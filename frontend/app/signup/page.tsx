import type { Metadata } from "next";
import { safeNext } from "@/lib/auth/returnTo";
import { getI18n } from "@/lib/i18n/server";
import SignupForm from "@/views/auth/SignupForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.signupTitle, robots: { index: false } };
}

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <SignupForm next={safeNext(next)} />;
}
