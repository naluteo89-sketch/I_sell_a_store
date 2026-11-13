import type { Locale } from "@/lib/i18n/config";

/** 백엔드(Spring Boot) 호출 공통 처리 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

/** 백엔드 ErrorResponse 의 message 를 그대로 화면에 보여준다 */
async function toError(res: Response): Promise<Error> {
  const body = await res.json().catch(() => null);
  return new Error(body?.message ?? `요청 실패 (${res.status})`);
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<T>;
}

/** 목록 API: 본문(배열) + 전체 개수(X-Total-Count 헤더) */
export async function getPage<T>(path: string, page = 1, size = Infinity, revalidate = 30): Promise<{ items: T[]; total: number; legacy?: boolean }> {
  // 목록은 30초 동안 같은 결과를 재사용 (새 상품 반영이 30초 늦는 대신 서버 부담이 크게 준다)
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw await toError(res);
  const items = (await res.json()) as T[];
  const header = res.headers.get("X-Total-Count");
  if (header !== null) return { items, total: Number(header) || 0 };
  // 페이지 나눔을 모르는 옛 백엔드가 전부 보내 와도, 화면에는 한 페이지만 그린다
  const start = (Math.max(1, page) - 1) * size;
  return { items: Number.isFinite(size) ? items.slice(start, start + size) : items, total: items.length, legacy: true };
}

export async function send<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toError(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * 언어 = 시장. 모든 방문자용 요청에 lang 을 붙여 백엔드가
 * 그 시장 대상 상품·그 언어의 상품명/설명·그 언어 유튜버 영상을 돌려주게 한다.
 * (규격: docs/market-api.md — ko → 한국 KR, en → 영미권 US)
 */
export function withLang(path: string, lang: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${lang}`;
}
