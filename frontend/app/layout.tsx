import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Anton, Black_Han_Sans, Metal_Mania, Noto_Serif_KR, Pirata_One } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { I18nProvider } from "@/controllers/useI18n";
import { getI18n } from "@/lib/i18n/server";
import { brandTheme } from "@/lib/theme";
import { isThemeMode, THEME_COLOR, THEME_COOKIE, type ThemeMode } from "@/lib/themeMode";
import { fetchCategories, fetchSite } from "@/models/api/siteApi";
import Footer from "@/views/layout/Footer";
import Header from "@/views/layout/Header";
import QuickViewSheet from "@/views/quickview/QuickViewSheet";
import Container from "@/views/ui/Container";

/** 서체는 빌드할 때 내려받아 자체 호스팅된다 (방문자 브라우저가 구글에 요청하지 않음) */
// ── 다크: 한국어 화면은 검은고딕(영문 포함), EN 화면만 몬스터 캔·리퀴드 데스 느낌
// EN 로고: 메탈 밴드 서체 / EN 제목: 굵고 좁은 Anton — 쓰는 화면에서만 내려받도록 preload: false
const metal = Metal_Mania({ weight: "400", subsets: ["latin"], variable: "--font-metal", display: "swap", preload: false });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap", preload: false });
const blackHan = Black_Han_Sans({ weight: "400", subsets: ["latin"], variable: "--font-blackhan", display: "swap", preload: false });
// ── 화이트 초콜릿: 블랙레터 로고 + 명조 제목 (테마를 바꿀 때만 내려받도록 preload: false)
const blackletter = Pirata_One({ weight: "400", subsets: ["latin"], variable: "--font-blackletter", display: "swap", preload: false });
// 한글 글리프가 커서 미리 받지 않고 필요한 글자만 내려받음
const serifKr = Noto_Serif_KR({ weight: ["700", "900"], subsets: ["latin"], variable: "--font-serif-kr", display: "swap", preload: false });
const fontVars = [metal, anton, blackHan, blackletter, serifKr].map((f) => f.variable).join(" ");

async function themeMode(): Promise<ThemeMode> {
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  return isThemeMode(saved) ? saved : "dark"; // 기본은 다크(고딕)
}

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  const { brand } = await fetchSite(locale);
  // 페이지마다 "페이지 이름 | 상호" 로 탭 제목이 바뀐다 (Vercel: Accurate page titles)
  return { title: { default: brand.name, template: `%s | ${brand.name}` }, description: brand.tagline || t.home.heroFallback };
}

/** 주소창·상태바 색을 배경과 맞추고, 확대는 막지 않는다 (WCAG 1.4.4) */
export async function generateViewport(): Promise<Viewport> {
  const mode = await themeMode();
  return { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: THEME_COLOR[mode], colorScheme: mode };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const i18n = await getI18n();
  const [site, categories] = await Promise.all([fetchSite(i18n.locale), fetchCategories(i18n.locale)]);

  // 브랜드 색상을 디자인 토큰(CSS 변수)으로 주입 → 모든 화면이 고객 색상으로 바뀜
  const theme = brandTheme(site.brand);
  const mode = await themeMode();

  return (
    <html lang={i18n.htmlLang} data-theme={mode} className={fontVars}>
      <body style={theme}>
        <I18nProvider locale={i18n.locale}>
          <a href="#main" className="skip-link">
            {i18n.t.nav.skip}
          </a>
          <Header site={site} categories={categories} theme={mode} />
          <Container as="main" id="main">
            {children}
          </Container>
          <Footer brand={site.brand} />
          <QuickViewSheet />
        </I18nProvider>
      </body>
    </html>
  );
}
