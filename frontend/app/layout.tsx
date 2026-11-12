import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchCategories, fetchSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await fetchSite();
  return { title: brand.name, description: brand.tagline };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [site, categories] = await Promise.all([fetchSite(), fetchCategories()]);

  // 브랜드 색상을 CSS 변수로 주입 → 모든 bg-brand / text-brand 가 고객 색상으로 바뀜
  const themeVars = {
    "--brand": site.brand.primaryColor,
    "--accent": site.brand.accentColor,
  } as CSSProperties;

  return (
    <html lang="ko">
      <body style={themeVars}>
        <Header site={site} categories={categories} />
        <main className="mx-auto max-w-7xl px-4">{children}</main>
        <Footer brand={site.brand} />
      </body>
    </html>
  );
}
