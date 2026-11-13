package com.isellastore.global.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 납품 시 고객별로 바뀌는 값 전체.
 * 코드 안에 상호·색상·문구를 직접 쓰지 말고 반드시 여기서 읽는다.
 */
@ConfigurationProperties(prefix = "store")
public record StoreProperties(
        String frontendOrigin,
        Brand brand,
        Features features,
        Youtube youtube,
        Sourcing sourcing
) {
    public record Brand(
            String name,
            String tagline,
            String logoUrl,
            String primaryColor,
            String accentColor,
            String phone,
            String email,
            String businessInfo
    ) {}

    public record Features(
            boolean cart,
            boolean payment,
            boolean reviews,
            boolean youtubePanel
    ) {}

    /** 유튜브 소개 제품 수집 */
    public record Sourcing(
            /** 영미권 유튜버 설명란의 달러 가격 → 원화 환산 환율 (1달러 = ?원) */
            long usdKrwRate
    ) {}

    public record Youtube(
            String apiKey,
            int refreshAfterDays,
            int maxRetentionDays,
            int maxResults,
            String keywordSuffix,
            int dailyRefreshBudget,
            String regionCode,
            String relevanceLanguage
    ) {
        public boolean enabled() {
            return apiKey != null && !apiKey.isBlank();
        }
    }
}
