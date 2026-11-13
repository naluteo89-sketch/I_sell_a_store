package com.isellastore.global.market;

/**
 * 언어 = 시장 (frontend/docs/market-api.md).
 * 프론트는 모든 방문자용 요청에 lang=ko|en 을 붙이고, 백엔드는 이 값으로 상품 노출·이름 언어·유튜브 검색 언어를 정한다.
 */
public enum Market {

    KR("ko", "KR", "ko"),
    US("en", "US", "en");

    private final String lang;
    private final String regionCode;
    private final String relevanceLanguage;

    Market(String lang, String regionCode, String relevanceLanguage) {
        this.lang = lang;
        this.regionCode = regionCode;
        this.relevanceLanguage = relevanceLanguage;
    }

    /** lang=ko|en → 시장. 없거나 모르는 값이면 KR */
    public static Market fromLang(String lang) {
        if (lang != null) {
            for (Market m : values()) if (m.lang.equalsIgnoreCase(lang.trim())) return m;
        }
        return KR;
    }

    public String lang() { return lang; }
    /** YouTube search.list regionCode (ISO 3166-1 alpha-2) */
    public String regionCode() { return regionCode; }
    /** YouTube search.list relevanceLanguage (ISO 639-1) */
    public String relevanceLanguage() { return relevanceLanguage; }
}
