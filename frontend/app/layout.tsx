import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { I18nProvider } from "@/controllers/useI18n";
import { getI18n } from "@/lib/i18n/server";
import { brandTheme } from "@/lib/theme";
import { fetchCategories, fetchSite } from "@/models/api/siteApi";
import Footer from "@/views/layout/Footer";
import Header from "@/views/layout/Header";
import Container from "@/views/ui/Container";

/** 영문·숫자용 둥근 서체. 빌드할 때 내려받아 자체 호스팅된다 (외부 요청 없음) */
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  const { brand } = await fetchSite(locale);
  // 페이지마다 "페이지 이름 | 상호" 로 탭 제목이 바뀐다 (Vercel: Accurate page titles)
  return { title: { default: brand.name, template: `%s | ${brand.name}` }, description: brand.tagline || t.home.heroFallback };
}

/** 주소창·상태바 색을 배경과 맞추고, 확대는 막지 않는다 (WCAG 1.4.4) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f6f8",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const i18n = await getI18n();
  const [site, categories] = await Promise.all([fetchSite(i18n.locale), fetchCategories(i18n.locale)]);

  // 브랜드 색상을 디자인 토큰(CSS 변수)으로 주입 → 모든 화면이 고객 색상으로 바뀜
  const theme = brandTheme(site.brand);

  return (
    <html lang={i18n.htmlLang} className={nunito.variable}>
      <body style={theme}>
        <I18nProvider locale={i18n.locale}>
          <a href="#main" className="skip-link">
            {i18n.t.nav.skip}
          </a>
          <Header site={site} categories={categories} />
          <Container as="main" id="main">
            {children}
          </Container>
          <Footer brand={site.brand} />
        </I18nProvider>
      </body>
    </html>
  );
}
