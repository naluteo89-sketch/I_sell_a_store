package com.isellastore.member.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.isellastore.global.error.ErrorResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * /api/auth/** 의 변경 요청(POST 등)에만 거는 CSRF 검사 — "쿠키 값 = 헤더 값" (double-submit cookie, OWASP).
 * 다른 사이트는 우리 쿠키를 읽을 수 없으니 헤더에 같은 값을 넣지 못한다.
 * 이름은 Spring Security 관례(XSRF-TOKEN / X-XSRF-TOKEN)를 따라, 나중에 Spring Security 로 옮겨도 프론트는 그대로다.
 */
@Component
public class AuthCsrfInterceptor implements HandlerInterceptor {

    public static final String COOKIE = "XSRF-TOKEN";
    public static final String HEADER = "X-XSRF-TOKEN";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ObjectMapper json;

    public AuthCsrfInterceptor(ObjectMapper json) {
        this.json = json;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();
        if ("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method)) {
            if (readCookie(request) == null) issue(request, response);
            return true;
        }
        String cookie = readCookie(request);
        String header = request.getHeader(HEADER);
        if (cookie != null && header != null
                && MessageDigest.isEqual(cookie.getBytes(StandardCharsets.UTF_8), header.getBytes(StandardCharsets.UTF_8))) {
            return true;
        }
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        json.writeValue(response.getWriter(), ErrorResponse.of(403, "보안 토큰이 없거나 맞지 않습니다. 페이지를 새로고침해 주세요."));
        return false;
    }

    private static String readCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (COOKIE.equals(c.getName()) && !c.getValue().isBlank()) return c.getValue();
        }
        return null;
    }

    private static void issue(HttpServletRequest request, HttpServletResponse response) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        // 프론트 스크립트가 읽어 헤더에 넣어야 하므로 HttpOnly 가 아니다
        ResponseCookie cookie = ResponseCookie.from(COOKIE, token)
                .httpOnly(false).sameSite("Lax").path("/").secure(request.isSecure()).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
