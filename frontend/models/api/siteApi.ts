import type { Locale } from "@/lib/i18n/config";
import type { Category, Site } from "../types";
import { get, withLang } from "./http";

/** 백엔드가 꺼져 있어도 화면이 깨지지 않도록 쓰는 기본값 */
export const FALLBACK_SITE: Site = {
  brand: {
    name: "you_HOWMUCH",
    tagline: "요즘 20·30을 위한 유튜버 리뷰템, 영상으로 보고 바로 담기",
    logoUrl: "",
    // 비워 두면 tokens.css 의 테마 색(다크 크림슨 / 화이트 초콜릿)을 그대로 쓴다
    primaryColor: "",
    accentColor: "",
    phone: "",
    email: "naluteo89@gmail.com",
    businessInfo: "대표 김다운",
  },
  features: { cart: true, payment: true, reviews: false, youtubePanel: true },
};

/** 브랜드 문구(태그라인 등)도 언어별로 받을 수 있다 */
export async function fetchSite(lang?: Locale): Promise<Site> {
  try {
    const site = await get<Site>(lang ? withLang("/api/site", lang) : "/api/site");
    return { ...site, brand: localizeBrand(withoutTemplateDefaults(site.brand), lang) };
  } catch {
    return { ...FALLBACK_SITE, brand: localizeBrand(FALLBACK_SITE.brand, lang) };
  }
}

/**
 * 백엔드가 옛 템플릿 기본값(I sell a store, 000-0000-0000 등)을 보내면 you_HOWMUCH 값으로 바꾼다.
 * 백엔드 설정을 바꾸고 재시작하기 전에도 화면이 항상 사이트 이름 you_HOWMUCH 로 나오게 하기 위함.
 * 고객이 직접 정한 값은 그대로 둔다.
 */
const TEMPLATE_DEFAULTS = {
  name: ["I sell a store"],
  tagline: ["리뷰 영상으로 먼저 보고 고르는 쇼핑"],
  phone: ["000-0000-0000"],
  email: ["help@example.com"],
  businessInfo: ["상호 · 대표 · 사업자등록번호 · 주소 (납품 시 입력)", "상호 · 대표 · 사업자등록번호 · 주소"],
};
export const SITE_TAGLINE = "요즘 20·30을 위한 유튜버 리뷰템, 영상으로 보고 바로 담기";

/** 사이트 이름·한 줄 소개는 언어별로: 한국어 "하우머치", 영어 "you_HOWMUCH" */
const SITE_NAME = { ko: "하우머치", en: "you_HOWMUCH" } as const;
const SITE_TAGLINE_BY_LANG = {
  ko: SITE_TAGLINE,
  en: "YouTuber-reviewed picks for your 20s and 30s. Watch the review, then add to cart.",
} as const;

function localizeBrand(brand: Site["brand"], lang?: Locale): Site["brand"] {
  const l: Locale = lang ?? "ko";
  const ours = (v: string) => Object.values(SITE_NAME).includes(v as never);
  const ourTagline = (v: string) => Object.values(SITE_TAGLINE_BY_LANG).includes(v as never);
  return {
    ...brand,
    name: ours(brand.name) ? SITE_NAME[l] : brand.name,
    tagline: ourTagline(brand.tagline) ? SITE_TAGLINE_BY_LANG[l] : brand.tagline,
  };
}

function withoutTemplateDefaults(brand: Site["brand"]): Site["brand"] {
  const is = (key: keyof typeof TEMPLATE_DEFAULTS, v: string) => !v || TEMPLATE_DEFAULTS[key].includes(v.trim());
  return {
    ...brand,
    name: is("name", brand.name) ? FALLBACK_SITE.brand.name : brand.name,
    tagline: is("tagline", brand.tagline) ? SITE_TAGLINE : brand.tagline,
    phone: is("phone", brand.phone) ? "" : brand.phone,
    email: is("email", brand.email) ? FALLBACK_SITE.brand.email : brand.email,
    businessInfo: is("businessInfo", brand.businessInfo) ? FALLBACK_SITE.brand.businessInfo : brand.businessInfo,
  };
}

export const fetchCategories = (lang?: Locale) =>
  get<Category[]>(lang ? withLang("/api/categories", lang) : "/api/categories").catch(() => [] as Category[]);
