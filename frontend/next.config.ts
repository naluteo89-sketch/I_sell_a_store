import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * 로그인 관련 주소만 같은 출처로 받아 백엔드(Spring Security)에 넘긴다.
   * → 세션 쿠키가 프론트 주소(localhost:3000)에 붙어 CORS·서드파티 쿠키 문제 없음
   * (규격: docs/auth-api.md)
   */
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${API}/api/auth/:path*` },
      { source: "/oauth2/authorization/:provider", destination: `${API}/oauth2/authorization/:provider` },
      { source: "/login/oauth2/code/:provider", destination: `${API}/login/oauth2/code/:provider` },
    ];
  },
};

export default nextConfig;
