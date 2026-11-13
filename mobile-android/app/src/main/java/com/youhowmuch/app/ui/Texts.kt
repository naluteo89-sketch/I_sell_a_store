package com.youhowmuch.app.ui

import com.youhowmuch.app.data.Lang
import com.youhowmuch.app.data.ProductSort

/** 화면 문구 (웹 lib/i18n/dictionaries.ts 와 같은 표현). 한국어·영어 키가 같아야 한다 */
data class Texts(
    val brand: String,
    val allProducts: String,
    val productCount: (Int) -> String,
    val sorts: Map<ProductSort, String>,
    val prev: String,
    val next: String,
    val page: (Int) -> String,
    val addToCart: String,
    val retry: String,
    val empty: String,
)

val KoTexts = Texts(
    brand = "하우머치",
    allProducts = "전체 상품",
    productCount = { "상품 %,d개".format(it) },
    sorts = mapOf(
        ProductSort.NEW to "최신순", ProductSort.VIDEO_VIEWS to "리뷰 조회수순", ProductSort.CHANNEL_VIEWS to "유튜버 인기순",
        ProductSort.PRICE_ASC to "낮은 가격순", ProductSort.PRICE_DESC to "높은 가격순", ProductSort.NAME to "이름순",
    ),
    prev = "이전", next = "다음", page = { "$it 페이지" },
    addToCart = "장바구니에 담기", retry = "다시 시도", empty = "상품이 없어요",
)

val EnTexts = Texts(
    brand = "you_HOWMUCH",
    allProducts = "All products",
    productCount = { "%,d products".format(it) },
    sorts = mapOf(
        ProductSort.NEW to "Newest", ProductSort.VIDEO_VIEWS to "Most-viewed reviews", ProductSort.CHANNEL_VIEWS to "Top creators",
        ProductSort.PRICE_ASC to "Price: low to high", ProductSort.PRICE_DESC to "Price: high to low", ProductSort.NAME to "Name",
    ),
    prev = "Previous", next = "Next", page = { "Page $it" },
    addToCart = "Give it to me", retry = "Try again", empty = "No products yet",
)

fun textsFor(lang: Lang) = if (lang == Lang.KO) KoTexts else EnTexts
