import type { Category, Site } from "../types";
import { get } from "./http";

/** 백엔드가 꺼져 있어도 화면이 깨지지 않도록 쓰는 기본값 */
export const FALLBACK_SITE: Site = {
  brand: {
    name: "I sell a store",
    tagline: "",
    logoUrl: "",
    primaryColor: "#111827",
    accentColor: "#ef4444",
    phone: "",
    email: "",
    businessInfo: "",
  },
  features: { cart: true, payment: true, reviews: false, youtubePanel: true },
};

export async function fetchSite(): Promise<Site> {
  try {
    return await get<Site>("/api/site");
  } catch {
    return FALLBACK_SITE;
  }
}

export const fetchCategories = () => get<Category[]>("/api/categories").catch(() => [] as Category[]);
