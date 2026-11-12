"use client";

import { useEffect, useState } from "react";

/** 브라우저에서만 읽히는 값(localStorage 등)을 쓰기 전, 첫 렌더 불일치를 막는다 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
