import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "@/styles/globals.css";
import { fetchCategories, fetchSite } from "@/models/api/siteApi";
import Footer from "@/views/layout/Footer";
import Header from "@/views/layout/Header";
import Container from "@/views/ui/Container";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await fetchSite();
  return { title: brand.name, description: brand.tagline };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [site, categories] = await Promise.all([fetchSite(), fetchCategories()]);

  // 브랜드 색상을 디자인 토큰(CSS 변수)으로 주입 → 모든 화면이 고객 색상으로 바뀜
  const theme = { "--brand": site.brand.primaryColor, "--accent": site.brand.accentColor } as CSSProperties;

  return (
    <html lang="ko">
      <body style={theme}>
        <Header site={site} categories={categories} />
        <Container as="main">{children}</Container>
        <Footer brand={site.brand} />
      </body>
    </html>
  );
}
