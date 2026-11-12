"use client";

import { useEffect, useState } from "react";

/**
 * 브라우저에서 마운트된 뒤에만 true.
 * 장바구니(localStorage)처럼 브라우저에서만 읽히는 값은 첫 렌더에 숨겨 서버 화면과 어긋나지 않게 한다.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
