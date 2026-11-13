package com.youhowmuch.app.ui.list

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.youhowmuch.app.data.Lang
import com.youhowmuch.app.data.Product
import com.youhowmuch.app.data.ProductSort
import com.youhowmuch.app.ui.Texts
import com.youhowmuch.app.ui.categoryLabel
import com.youhowmuch.app.ui.formatPrice
import com.youhowmuch.app.ui.imageView
import com.youhowmuch.app.ui.theme.YhmTheme

@Composable
fun ProductListScreen(vm: ProductListViewModel, lang: Lang, t: Texts) {
    val s by vm.state.collectAsStateWithLifecycle()
    val c = YhmTheme.colors
    val grid = rememberLazyGridState()
    // 페이지가 바뀌면 맨 위로
    LaunchedEffect(s.page, s.sort) { grid.scrollToItem(0) }

    Column(Modifier.fillMaxSize().background(c.bg).statusBarsPadding()) {
        // 상단 바: 로고
        Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(t.brand, color = c.text, fontWeight = FontWeight.Black, fontSize = 20.sp)
        }

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            state = grid,
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item(span = { GridItemSpan(2) }) {
                Column(Modifier.padding(top = 4.dp, bottom = 4.dp)) {
                    Text(t.allProducts, style = MaterialTheme.typography.headlineMedium, color = c.text)
                    if (s.total > 0) Text(t.productCount(s.total), style = MaterialTheme.typography.bodySmall, color = c.textMuted)
                    Spacer(Modifier.height(12.dp))
                    SortChips(s.sort, t) { vm.load(1, it) }
                }
            }

            when {
                s.loading && s.items.isEmpty() -> item(span = { GridItemSpan(2) }) {
                    Box(Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = c.brand) }
                }
                s.error != null -> item(span = { GridItemSpan(2) }) {
                    Column(Modifier.fillMaxWidth().padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(s.error.orEmpty(), color = c.textMuted, style = MaterialTheme.typography.bodyMedium)
                        Spacer(Modifier.height(12.dp))
                        SoftButton(t.retry) { vm.load(s.page) }
                    }
                }
                s.items.isEmpty() -> item(span = { GridItemSpan(2) }) {
                    Text(t.empty, color = c.textMuted, modifier = Modifier.padding(32.dp))
                }
                else -> {
                    items(s.items, key = { it.id }) { p -> ProductCard(p, lang, t) }
                    item(span = { GridItemSpan(2) }) {
                        Pager(s.page, hasPrev = s.page > 1, hasNext = s.hasNext, t = t, onPrev = vm::prev, onNext = vm::next)
                    }
                }
            }
        }
        Spacer(Modifier.navigationBarsPadding())
    }
}

@Composable
private fun SortChips(selected: ProductSort, t: Texts, onSelect: (ProductSort) -> Unit) {
    val c = YhmTheme.colors
    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        ProductSort.entries.forEach { sort ->
            val on = sort == selected
            Text(
                t.sorts[sort].orEmpty(),
                color = if (on) c.onBrand else c.text,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(if (on) c.brand else c.softButton)
                    .clickable { onSelect(sort) }
                    .padding(horizontal = 14.dp, vertical = 10.dp), // 터치 높이 확보
            )
        }
    }
}

@Composable
private fun ProductCard(p: Product, lang: Lang, t: Texts) {
    val c = YhmTheme.colors
    val img = imageView(p.imageUrl)
    Column(
        Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(c.surface)
            .border(1.dp, c.border, RoundedCornerShape(16.dp)),
    ) {
        AsyncImage(
            model = img.url,
            contentDescription = p.name,
            contentScale = ContentScale.Crop,
            alignment = img.alignment,
            modifier = Modifier.fillMaxWidth().aspectRatio(1f).padding(6.dp).clip(RoundedCornerShape(12.dp)).background(c.bgMuted),
        )
        Column(Modifier.padding(start = 12.dp, end = 8.dp, top = 6.dp, bottom = 10.dp)) {
            Text(categoryLabel(lang, p.categorySlug, p.categoryName), color = c.brandInk, style = MaterialTheme.typography.labelSmall)
            Text(
                p.name, color = c.text, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold,
                maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 2.dp).height(40.dp),
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(formatPrice(lang, p.price), color = c.text, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, modifier = Modifier.weight(1f))
                // 빠른 보기는 3단계에서 연결 (웹과 같이: 아이콘 = 담기 시트, 카드 = 상세)
                Box(
                    Modifier.size(44.dp).semantics { contentDescription = t.addToCart },
                    contentAlignment = Alignment.Center,
                ) {
                    Box(Modifier.size(32.dp).clip(CircleShape).background(c.softButton), contentAlignment = Alignment.Center) {
                        CartIcon(c.text)
                    }
                }
            }
        }
    }
}

@Composable
private fun Pager(page: Int, hasPrev: Boolean, hasNext: Boolean, t: Texts, onPrev: () -> Unit, onNext: () -> Unit) {
    val c = YhmTheme.colors
    Row(Modifier.fillMaxWidth().padding(top = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
        SoftButton("‹ ${t.prev}", enabled = hasPrev, onClick = onPrev)
        // 웹과 같이 현재 페이지만 표시 (전체 페이지 수 = 상품 규모는 보이지 않게)
        Text(t.page(page), color = c.text, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 20.dp))
        SoftButton("${t.next} ›", enabled = hasNext, onClick = onNext)
    }
}

@Composable
fun SoftButton(label: String, enabled: Boolean = true, onClick: () -> Unit) {
    val c = YhmTheme.colors
    Text(
        label,
        color = if (enabled) c.text else c.textFaint.copy(alpha = 0.5f),
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier
            .clip(CircleShape)
            .background(c.softButton)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 18.dp, vertical = 12.dp),
    )
}

/** 장바구니 아이콘 (아이콘 라이브러리 없이 선으로 그림) */
@Composable
fun CartIcon(color: Color, size: Int = 16) {
    Canvas(Modifier.size(size.dp)) {
        val w = this.size.width
        val stroke = Stroke(width = w * 0.1f, cap = StrokeCap.Round, join = StrokeJoin.Round)
        val path = Path().apply {
            moveTo(w * 0.05f, w * 0.12f); lineTo(w * 0.2f, w * 0.12f)
            lineTo(w * 0.32f, w * 0.62f); lineTo(w * 0.82f, w * 0.62f)
            lineTo(w * 0.94f, w * 0.28f); lineTo(w * 0.25f, w * 0.28f)
        }
        drawPath(path, color, style = stroke)
        drawCircle(color, radius = w * 0.08f, center = androidx.compose.ui.geometry.Offset(w * 0.38f, w * 0.84f))
        drawCircle(color, radius = w * 0.08f, center = androidx.compose.ui.geometry.Offset(w * 0.76f, w * 0.84f))
    }
}
