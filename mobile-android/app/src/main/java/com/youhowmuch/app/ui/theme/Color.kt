package com.youhowmuch.app.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * 웹 frontend/styles/tokens.css 와 같은 값.
 * 다크 "고딕 누아르"(기본) — 붉은 기운의 검정 + 크림슨
 * 라이트 "화이트 초콜릿" — 브라운을 섞은 아이보리 + 다크 초콜릿
 * 글자색은 모두 배경·면 위에서 대비 4.5:1 이상 (웹과 같은 계산값)
 */
data class YhmColors(
    val brand: Color,        // 주 버튼·선택 탭 바탕
    val onBrand: Color,
    val brandInk: Color,     // 브랜드색을 글자로 쓸 때
    val accent: Color,       // 배지·재생 버튼
    val accentText: Color,
    val text: Color,
    val textMuted: Color,
    val textFaint: Color,
    val bg: Color,
    val surface: Color,
    val bgMuted: Color,
    val border: Color,
    val softButton: Color,   // 반투명 흰 면 버튼 (다크에서 버튼이 묻히지 않게)
    val danger: Color,
    val isDark: Boolean,
)

val DarkGothic = YhmColors(
    brand = Color(0xFFDC143C),
    onBrand = Color(0xFFFFFFFF),
    brandInk = Color(0xFFFF5560),
    accent = Color(0xFF8E1730),
    accentText = Color(0xFFFF6168),
    text = Color(0xFFF4EAEC),
    textMuted = Color(0xFFCBB5BA),
    textFaint = Color(0xFFB39CA4),
    bg = Color(0xFF0B0607),
    surface = Color(0xFF1F1016),
    bgMuted = Color(0xFF30181F),
    border = Color(0xFF4D2631),
    softButton = Color(0x1CFFFFFF),
    danger = Color(0xFFFF8A9A),
    isDark = true,
)

val WhiteChocolate = YhmColors(
    brand = Color(0xFF5A3522),
    onBrand = Color(0xFFFFF6EA),
    brandInk = Color(0xFF5A3522),
    accent = Color(0xFF9C4A36),
    accentText = Color(0xFF8A3E2C),
    text = Color(0xFF2B1C14),
    textMuted = Color(0xFF654F40),
    textFaint = Color(0xFF6B5444),
    bg = Color(0xFFF2E8D8),
    surface = Color(0xFFFFF8EC),
    bgMuted = Color(0xFFE7D8C0),
    border = Color(0xFFDCCAB0),
    softButton = Color(0x145A3522),
    danger = Color(0xFFA33A44),
    isDark = false,
)
