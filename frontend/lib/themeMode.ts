/** 화면 테마: 다크(고딕 누아르, 기본) / 라이트(화이트 초콜릿). 쿠키로 기억해 서버가 첫 화면부터 맞게 그린다 */
export type ThemeMode = "dark" | "light";
export const THEME_COOKIE = "theme";
export const isThemeMode = (v: unknown): v is ThemeMode => v === "dark" || v === "light";
/** 주소창·상태바 색 (tokens.css 의 --bg 와 같게) */
export const THEME_COLOR: Record<ThemeMode, string> = { dark: "#07060a", light: "#f5eedf" };
