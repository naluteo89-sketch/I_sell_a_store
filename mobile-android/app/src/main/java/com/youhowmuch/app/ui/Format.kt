package com.youhowmuch.app.ui

import androidx.compose.ui.Alignment
import com.youhowmuch.app.BuildConfig
import com.youhowmuch.app.data.Lang
import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

/** 웹 lib/i18n/format.ts 와 같은 규칙: 저장·계산은 원화, 표시만 시장에 맞춤 (한국어 = 원, 영어 = 달러) */
private val usd = NumberFormat.getCurrencyInstance(Locale.US).apply { currency = Currency.getInstance("USD") }
private val krw = NumberFormat.getIntegerInstance(Locale.KOREA)

fun formatPrice(lang: Lang, won: Long): String =
    if (lang == Lang.KO) "${krw.format(won)}원" else usd.format(won / BuildConfig.USD_KRW_RATE)

/** 영어 화면용 카테고리 이름 (DB 이름은 한국어라 slug 로 찾고, 없으면 원래 이름) */
private val categoryEn = mapOf("fashion" to "Fashion", "goods" to "Goods", "living" to "Home & Living", "digital" to "Tech")

fun categoryLabel(lang: Lang, slug: String?, name: String?): String =
    if (lang == Lang.EN) categoryEn[slug] ?: name.orEmpty() else name.orEmpty()

/**
 * 상품 이미지 주소의 "#crop=left|right" (같은 영상 장면을 상품마다 다르게 자른 위치, 백엔드 FrameImageAssigner)
 * → 이미지 정렬 위치. 실제 요청 주소에서는 # 뒤를 뗀다.
 */
data class ImageView(val url: String?, val alignment: Alignment)

fun imageView(raw: String?): ImageView {
    if (raw.isNullOrBlank()) return ImageView(null, Alignment.Center)
    val url = raw.substringBefore('#')
    val crop = raw.substringAfter("#crop=", "")
    val align = when (crop) {
        "left" -> Alignment.CenterStart
        "right" -> Alignment.CenterEnd
        else -> Alignment.Center
    }
    return ImageView(url, align)
}
