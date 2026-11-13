package com.isellastore.member.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

/**
 * 로그인 상태 = 서버 세션에 회원 id 하나.
 * 세션 쿠키(JSESSIONID)는 HttpOnly · SameSite=Lax 라 스크립트로 읽을 수 없고 다른 사이트에서 보낸 요청에 실리지 않는다.
 */
public final class AuthSession {

    public static final String MEMBER_ID = "AUTH_MEMBER_ID";
    static final Duration REMEMBER = Duration.ofDays(14);

    private AuthSession() {}

    public static Long memberId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object id = session.getAttribute(MEMBER_ID);
        return id instanceof Long l ? l : null;
    }

    /** 로그인 성공: 세션 ID 를 새로 발급(세션 고정 공격 방지)하고 회원 id 를 기록 */
    public static void signIn(HttpServletRequest request, HttpServletResponse response, Long memberId, boolean remember) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            request.changeSessionId();
            session = request.getSession(false);
        } else {
            session = request.getSession(true);
        }
        session.setAttribute(MEMBER_ID, memberId);
        if (remember) {
            session.setMaxInactiveInterval((int) REMEMBER.toSeconds());
            // 브라우저를 닫아도 유지되도록 같은 세션 쿠키를 만료일을 붙여 다시 내려준다
            ResponseCookie cookie = ResponseCookie.from("JSESSIONID", session.getId())
                    .httpOnly(true).sameSite("Lax").path("/").maxAge(REMEMBER)
                    .secure(request.isSecure())
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
    }

    public static void signOut(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        ResponseCookie expired = ResponseCookie.from("JSESSIONID", "")
                .httpOnly(true).sameSite("Lax").path("/").maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, expired.toString());
    }
}
