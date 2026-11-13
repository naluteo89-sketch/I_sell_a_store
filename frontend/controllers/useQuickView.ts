"use client";

import { create } from "zustand";
import type { Product } from "@/models/types";

type QuickViewState = {
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
};

/** C — 빠른 보기 시트: 목록을 떠나지 않고 상품 내용·리뷰 영상·옵션을 보고 담는다 */
export const useQuickView = create<QuickViewState>()((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
