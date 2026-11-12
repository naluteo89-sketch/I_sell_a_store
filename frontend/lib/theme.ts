import type { CSSProperties } from "react";
import type { Brand } from "@/models/types";

/**
 * 백엔드 브랜드 색상을 CSS 변수로 덮어쓴다.
 * 백엔드 application.yml 의 예전 기본값(#111827 / #ef4444)은 "따로 정하지 않음"으로 보고
 * tokens.css 의 기본 팔레트를 쓴다. 고객 색을 정하면(BRAND_PRIMARY_COLOR 등) 그 색이 적용된다.
 */
const LEGACY_DEFAULTS = new Set(["#111827", "#ef4444"]);
const HEX = /^#[0-9a-f]{3,8}$/i;

export function brandTheme(brand: Brand): CSSProperties {
  const theme: Record<string, string> = {};
  const pick = (v: string | undefined) => (v && HEX.test(v) && !LEGACY_DEFAULTS.has(v.toLowerCase()) ? v : null);
  const primary = pick(brand.primaryColor);
  const accent = pick(brand.accentColor);
  if (primary) theme["--brand"] = primary;
  if (accent) theme["--accent"] = accent;
  return theme as CSSProperties;
}
