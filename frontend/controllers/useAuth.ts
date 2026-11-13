"use client";

import { create } from "zustand";
import { authApi } from "@/models/api/authApi";
import type { AuthUser } from "@/models/types";

type Status = "idle" | "loading" | "authed" | "guest";

type AuthState = {
  user: AuthUser | null;
  status: Status;
  /** 처음 한 번만 서버에 물어본다 (헤더·계정 화면이 같이 불러도 요청은 하나) */
  ensure: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

/**
 * C — 로그인 상태. 세션은 서버(HttpOnly 쿠키)에 있고, 여기는 화면용 사본일 뿐이다.
 * 토큰을 localStorage 에 두지 않는다 (XSS 로 탈취 가능 — OWASP Session Management).
 */
export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  status: "idle",
  ensure: async () => {
    if (get().status !== "idle") return;
    await get().refresh();
  },
  refresh: async () => {
    if (!get().user) set({ status: "loading" });
    try {
      const user = await authApi.me();
      set({ user, status: user ? "authed" : "guest" });
      return user;
    } catch {
      set({ user: null, status: "guest" });
      return null;
    }
  },
  setUser: (user) => set({ user, status: "authed" }),
  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: "guest" });
    }
  },
}));
