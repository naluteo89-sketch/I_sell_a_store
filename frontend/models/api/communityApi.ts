/**
 * 커뮤니티 API — 글은 모두 백엔드(DB)에서 온다. (규격: docs/community-api.md)
 * 프론트에는 예시 글을 두지 않는다. 백엔드가 꺼져 있으면 화면이 오류 상태로 안내한다.
 */
import type {
  CommunityBoard,
  CommunityComment,
  CommunityCommentForm,
  CommunityPage,
  CommunityPost,
  CommunityPostForm,
} from "../types";
import type { Locale } from "@/lib/i18n/config";
import { get, send, withLang } from "./http";

/** lang: 그 언어로 쓰인 글만 (영미권 사용자에게는 영어 글) */
export type ListParams = { board?: CommunityBoard; page?: number; size?: number; lang: Locale };

export const PAGE_SIZE = 10;

export const communityApi = {
  list: ({ board, page = 1, size = PAGE_SIZE, lang }: ListParams) => {
    const qs = new URLSearchParams({ page: String(page), size: String(size) });
    if (board) qs.set("board", board);
    return get<CommunityPage>(withLang(`/api/community/posts?${qs}`, lang));
  },
  get: (id: number) => get<CommunityPost>(`/api/community/posts/${id}`),
  /** 글의 언어(lang)를 함께 저장 */
  create: (form: CommunityPostForm, lang: Locale) => send<CommunityPost>("/api/community/posts", "POST", { ...form, lang }),
  remove: (id: number, password: string) => send<void>(`/api/community/posts/${id}/delete`, "POST", { password }),
  comment: (id: number, form: CommunityCommentForm) => send<CommunityComment>(`/api/community/posts/${id}/comments`, "POST", form),
  like: (id: number) => send<{ likeCount: number; liked: boolean }>(`/api/community/posts/${id}/like`, "POST"),
};

export const BOARDS: CommunityBoard[] = ["review", "question", "free"];
export const isBoard = (v: unknown): v is CommunityBoard => BOARDS.includes(v as CommunityBoard);
