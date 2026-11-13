package com.youhowmuch.app.data

import kotlinx.serialization.Serializable

/** 웹 frontend/models/types.ts 와 같은 모양 (백엔드 DTO 1:1). 모르는 필드는 무시 */

@Serializable
data class ProductAttribute(val name: String = "", val value: String = "")

@Serializable
data class ProductOptionValue(val id: Long = 0, val name: String = "")

@Serializable
data class ProductOption(val id: Long = 0, val name: String = "", val values: List<ProductOptionValue> = emptyList())

@Serializable
data class ProductVariant(
    val id: Long = 0,
    val sku: String? = null,
    val label: String = "",
    val optionValueIds: List<Long> = emptyList(),
    val additionalPrice: Long = 0,
    val price: Long = 0,
    val stock: Int = 0,
)

@Serializable
data class Product(
    val id: Long,
    val name: String = "",
    val description: String? = null,
    /** 원화. 영어(영미권) 화면에서는 표시만 달러로 환산 */
    val price: Long = 0,
    val stock: Int = 0,
    val imageUrl: String? = null,
    val categorySlug: String? = null,
    val categoryName: String? = null,
    val attributes: List<ProductAttribute> = emptyList(),
    val options: List<ProductOption> = emptyList(),
    val variants: List<ProductVariant> = emptyList(),
    val videoViewCount: Long? = null,
    val channelTitle: String? = null,
    val primaryVideoId: String? = null,
)

@Serializable
data class Video(
    val videoId: String,
    val title: String? = null,
    val channelTitle: String? = null,
    val thumbnailUrl: String? = null,
    val viewCount: Long = 0,
    val productCount: Int? = null,
)

@Serializable
data class AuthUser(
    val id: Long,
    val email: String,
    val nickname: String,
    val avatarUrl: String? = null,
    val providers: List<String> = emptyList(),
    val role: String? = null,
)

/** 목록 한 페이지 + 전체 개수(X-Total-Count 헤더) */
data class Page<T>(val items: List<T>, val total: Int)

/** 웹 ProductSort 와 같은 값 */
enum class ProductSort(val query: String) {
    NEW("new"), VIDEO_VIEWS("videoViews"), CHANNEL_VIEWS("channelViews"),
    PRICE_ASC("priceAsc"), PRICE_DESC("priceDesc"), NAME("name"),
}

/** 언어 = 시장. ko → 한국 상품·원, en → 영미권 상품·달러 (웹 docs/market-api.md) */
enum class Lang(val code: String) { KO("ko"), EN("en") }
