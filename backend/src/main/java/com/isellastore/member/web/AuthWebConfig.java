package com.isellastore.member.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 로그인 API 에만 CSRF 검사를 건다 (기존 주문·관리자 API 동작은 바꾸지 않음) */
@Configuration
public class AuthWebConfig implements WebMvcConfigurer {

    private final AuthCsrfInterceptor csrf;

    public AuthWebConfig(AuthCsrfInterceptor csrf) {
        this.csrf = csrf;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(csrf).addPathPatterns("/api/auth/**");
    }
}
