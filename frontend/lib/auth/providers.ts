import type { Locale } from "@/lib/i18n/config";
import type { AuthProviderId } from "@/models/types";

export const PROVIDER_IDS: AuthProviderId[] = ["google", "kakao", "naver", "apple"];

export const isProviderId = (v: unknown): v is AuthProviderId =>
  typeof v === "string" && (PROVIDER_IDS as string[]).includes(v);

/**
 * 언어 = 시장. 백엔드가 켜진 목록을 못 줄 때 쓰는 기본 순서.
 * - 한국: 카카오 · 네이버 · Google (국내 가입 비중 순)
 * - 영미권: Google · Apple
 */
export const DEFAULT_PROVIDERS: Record<Locale, AuthProviderId[]> = {
  ko: ["kakao", "naver", "google"],
  en: ["google", "apple"],
};

/**
 * 버튼 심볼은 각 회사가 배포한 공식 파일을 public/sso/ 에 넣어 쓴다.
 * 직접 그린 아이콘은 각사 가이드 위반 (Google: "Don't create your own icon", 카카오: 심볼 변형 금지)
 * → 받는 곳은 docs/auth-api.md 「버튼 심볼 파일」 참고
 */
export const providerIcon = (id: AuthProviderId) => `/sso/${id}.svg`;

/** SSO 시작 주소 (Spring Security 기본 경로, next.config rewrites 로 백엔드에 전달) */
export const ssoStartUrl = (id: AuthProviderId) => `/oauth2/authorization/${id}`;
