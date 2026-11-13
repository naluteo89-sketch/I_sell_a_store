"use client";

import { create } from "zustand";

/** 페이지를 넘긴 방향(-1 이전 / 1 다음)과 직전 페이지 — 새 목록이 그 방향에서 밀려 들어오게 */
type PagerState = {
  direction: -1 | 0 | 1;
  lastPage: number | null;
  go: (from: number, to: number) => void;
  seen: (page: number) => void;
};

export const usePagerStore = create<PagerState>()((set) => ({
  direction: 0,
  lastPage: null,
  go: (from, to) => set({ direction: to > from ? 1 : to < from ? -1 : 0 }),
  seen: (page) => set({ lastPage: page }),
}));

/** 입력 중이거나 시트가 열려 있으면 ← → 를 가로채지 않는다 */
export function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || !!el.closest("dialog[open]");
}
