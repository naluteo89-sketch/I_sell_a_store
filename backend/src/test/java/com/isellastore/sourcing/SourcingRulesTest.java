package com.isellastore.sourcing;

import com.isellastore.global.market.Market;
import com.isellastore.sourcing.service.SourcingRules;
import com.isellastore.sourcing.service.SourcingRules.Found;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** DB 없이 도는 순수 단위 테스트 */
class SourcingRulesTest {

    @Test
    void 만원_미만은_100원_단위로_올림() {
        assertEquals(4_400, SourcingRules.salePrice(4_350));
        assertEquals(10_000, SourcingRules.salePrice(9_950));
        assertEquals(1_000, SourcingRules.salePrice(990));
    }

    @Test
    void 만원_이상은_1000원_단위로_올림() {
        assertEquals(24_000, SourcingRules.salePrice(23_450));
        assertEquals(160_000, SourcingRules.salePrice(159_900));
        assertEquals(11_000, SourcingRules.salePrice(10_001));
    }

    @Test
    void 이미_딱_떨어지면_1000원_추가() {
        assertEquals(5_000, SourcingRules.salePrice(4_000));
        assertEquals(5_200, SourcingRules.salePrice(4_200));
        assertEquals(24_000, SourcingRules.salePrice(23_000));
        assertEquals(11_000, SourcingRules.salePrice(10_000));
    }

    @Test
    void 설명란_가격줄에서_제품을_뽑는다() {
        String desc = """
                오늘 산 옷 소개해요
                1. 메리노크루넥스웨터(반팔)- 19,900원
                2. 미니T(긴팔)래글런 - 19,900원
                ✔️프라이빗슬림긴팔티-17,000원
                 1. 로템버 오디너리 크롭 스트라이프 셔츠 M [74,000원 → 44,400원, 40% 할인]
                """;
        assertEquals(List.of(
                new Found("메리노크루넥스웨터(반팔)", 19_900L),
                new Found("미니T(긴팔)래글런", 19_900L),
                new Found("프라이빗슬림긴팔티", 17_000L),
                new Found("로템버 오디너리 크롭 스트라이프 셔츠 M", 74_000L)
        ), SourcingRules.productsFrom(desc));
    }

    @Test
    void 가격만_있는_줄은_윗줄이_제품명() {
        String desc = """
                무스탕 숏 자켓
                https://musinsa.com/abc
                379,900원 → 265,930원 (30% 할인)
                """;
        assertEquals(List.of(new Found("무스탕 숏 자켓", 379_900L)), SourcingRules.productsFrom(desc));
    }

    @Test
    void 가격없이_링크만_있으면_가격_null() {
        String desc = """
                00:27 겨울 코디의 주인공 : 아우터
                📌처음 코트 입문
                무신사 스탠다드 캐시미어 블렌드 오버사이즈 싱글 코트
                https://www.musinsa.com/products/123
                """;
        assertEquals(List.of(new Found("무신사 스탠다드 캐시미어 블렌드 오버사이즈 싱글 코트", null)),
                SourcingRules.productsFrom(desc));
    }

    @Test
    void 제품명이_아닌_줄은_거른다() {
        String desc = """
                NAVY / LIGHT PINK 36,000원
                rem1 10,000원
                페이스북
                https://facebook.com/x
                추천 아이템 한 번에 보기
                https://musinsa.com/list
                너무 활용 잘하구 있는 퍼목도리에요 인플 감성
                https://shop.com/1
                5위. 플라워 주름 캉캉 롱 스커트 24,900원
                브랜디드 1967 JET BLACK JEANS
                https://shop.com/2
                """;
        assertEquals(List.of(
                new Found("플라워 주름 캉캉 롱 스커트", 24_900L),
                new Found("브랜디드 1967 JET BLACK JEANS", null)
        ), SourcingRules.productsFrom(desc));
    }

    @Test
    void 제품_목록이_없으면_빈_목록() {
        assertEquals(List.of(), SourcingRules.productsFrom("구독과 좋아요 부탁드려요!\n📮email / abc@example.com"));
        assertEquals(List.of(), SourcingRules.productsFrom("배송비 3,000원, 쿠폰 할인 5,000원"));
        assertEquals(List.of(), SourcingRules.productsFrom(null));
    }

    @Test
    void 설명란에서_처음_나오는_가격을_찾는다() {
        assertEquals(129_000L, SourcingRules.priceFrom("▶ 제품 정보\n가격: 129,000원 (할인가 99,000원)"));
        assertEquals(129_000L, SourcingRules.priceFrom("정가 12만9천원, 지금은 더 싸요"));
        assertEquals(399_000L, SourcingRules.priceFrom("39.9만원에 샀어요"));
        assertEquals(35_000L, SourcingRules.priceFrom("₩35,000"));
    }

    @Test
    void 가격이_아닌_숫자는_무시한다() {
        assertNull(SourcingRules.priceFrom("구독자 10000명 감사합니다! 2024년 영상"));
        assertNull(SourcingRules.priceFrom("배송비 500원"));
        assertNull(SourcingRules.priceFrom(""));
        assertNull(SourcingRules.priceFrom(null));
    }

    @Test
    void 테스트_가격은_7701원() {
        assertEquals(7_701, SourcingRules.TEST_PRICE);
    }

    // ───────── 영미권 유튜버 (US) ─────────

    @Test
    void 달러_가격은_센트로_읽는다() {
        assertEquals(34_800L, SourcingRules.priceFrom("Sony WH-1000XM5 ($348)", Market.US));
        assertEquals(2_999L, SourcingRules.priceFrom("only $29.99 right now", Market.US));
        assertEquals(129_900L, SourcingRules.priceFrom("US$ 1,299", Market.US));
        assertEquals(4_950L, SourcingRules.priceFrom("49.5 USD", Market.US));
        assertNull(SourcingRules.priceFrom("I have 2000 subscribers", Market.US));
        assertNull(SourcingRules.priceFrom("29,900원", Market.US));
    }

    @Test
    void 달러는_원화로_바꾼_뒤_가격규칙() {
        assertEquals(41_986L, SourcingRules.toKrw(Market.US, 2_999, 1_400));        // $29.99 × 1400
        assertEquals(42_000L, SourcingRules.salePrice(SourcingRules.toKrw(Market.US, 2_999, 1_400)));
        assertEquals(29_900L, SourcingRules.toKrw(Market.KR, 29_900, 1_400));      // 원화는 그대로
    }

    @Test
    void 영어_설명란에서_제품을_뽑는다() {
        String desc = """
                PRODUCTS MENTIONED
                1. Sony WH-1000XM5 ($348): https://amzn.to/abc
                Dyson Airwrap Complete - https://amzn.to/def
                Stanley Quencher Tumbler
                https://amzn.to/ghi
                Amazon storefront: https://amazon.com/shop/me
                Use my code SAVE10 for 10% off!
                Instagram: https://instagram.com/me
                NAVY BLUE $45
                I love this one so much: https://amzn.to/jkl
                """;
        assertEquals(List.of(
                new Found("Sony WH-1000XM5", 34_800L),
                new Found("Dyson Airwrap Complete", null),
                new Found("Stanley Quencher Tumbler", null)
        ), SourcingRules.productsFrom(desc, Market.US));
    }

    @Test
    void 한국어_줄은_영어_시장에서_무시() {
        assertEquals(List.of(), SourcingRules.productsFrom("메리노크루넥스웨터 - 19,900원", Market.US));
    }
}
