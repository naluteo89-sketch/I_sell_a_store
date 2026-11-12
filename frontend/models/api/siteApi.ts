import type { Locale } from "@/lib/i18n/config";
import type { Category, Site } from "../types";
import { get, withLang } from "./http";

/** 백엔드가 꺼져 있어도 화면이 깨지지 않도록 쓰는 기본값 */
export const FALLBACK_SITE: Site = {
  brand: {
    name: "I sell a store",
    tagline: "",
    logoUrl: "",
    primaryColor: "#3d5a80",
    accentColor: "#e98a95",
    phone: "",
    email: "",
    businessInfo: "",
  },
  features: { cart: true, payment: true, reviews: false, youtubePanel: true },
};

/** 브랜드 문구(태그라인 등)도 언어별로 받을 수 있다 */
export async function fetchSite(lang?: Locale): Promise<Site> {
  try {
    return await get<Site>(lang ? withLang("/api/site", lang) : "/api/site");
  } catch {
    return FALLBACK_SITE;
  }
}

export const fetchCategories = (lang?: Locale) =>
  get<Category[]>(lang ? withLang("/api/categories", lang) : "/api/categories").catch(() => [] as Category[]);
