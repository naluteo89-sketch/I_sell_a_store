package com.youhowmuch.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf

val LocalYhmColors = staticCompositionLocalOf { DarkGothic }

/** 화면에서는 YhmTheme.colors.brand 처럼 웹 토큰 이름 그대로 쓴다 */
object YhmTheme {
    val colors: YhmColors
        @Composable @ReadOnlyComposable get() = LocalYhmColors.current
}

/**
 * 기본은 다크 고딕. 웹과 같이 시스템 설정을 따르지 않고 사용자가 고른 값을 쓴다.
 * (웹은 쿠키, 앱은 설정 저장 — 2단계에서 토글 연결)
 */
@Composable
fun YhmAppTheme(dark: Boolean = true, content: @Composable () -> Unit) {
    val c = if (dark) DarkGothic else WhiteChocolate
    val scheme = if (dark) {
        darkColorScheme(
            primary = c.brand, onPrimary = c.onBrand,
            secondary = c.accent, onSecondary = c.onBrand,
            background = c.bg, onBackground = c.text,
            surface = c.surface, onSurface = c.text,
            surfaceVariant = c.bgMuted, onSurfaceVariant = c.textMuted,
            outline = c.border, error = c.danger,
        )
    } else {
        lightColorScheme(
            primary = c.brand, onPrimary = c.onBrand,
            secondary = c.accent, onSecondary = c.onBrand,
            background = c.bg, onBackground = c.text,
            surface = c.surface, onSurface = c.text,
            surfaceVariant = c.bgMuted, onSurfaceVariant = c.textMuted,
            outline = c.border, error = c.danger,
        )
    }
    CompositionLocalProvider(LocalYhmColors provides c) {
        MaterialTheme(colorScheme = scheme, typography = YhmTypography, content = content)
    }
}
