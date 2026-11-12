"use client";

import { useEffect } from "react";

/** C — 작성 중인 내용이 있을 때 새로고침·탭 닫기 전에 확인 (Vercel: Warn before navigation) */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/** 입력 하나뿐인 화면에서 데스크톱일 때만 자동 포커스 (모바일은 키보드가 갑자기 올라오지 않게) */
export function useDesktopAutofocus<T extends HTMLElement>(el: T | null) {
  useEffect(() => {
    if (el && window.matchMedia("(pointer: fine)").matches) el.focus({ preventScroll: true });
  }, [el]);
}

/** textarea 에서 Ctrl/⌘+Enter 로 제출 (Enter 는 줄바꿈) */
export function submitOnModEnter(e: { key: string; ctrlKey: boolean; metaKey: boolean; currentTarget: HTMLTextAreaElement; preventDefault(): void }) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }
}
