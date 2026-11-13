package com.youhowmuch.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.youhowmuch.app.data.ApiClient
import com.youhowmuch.app.data.Lang
import com.youhowmuch.app.ui.list.ProductListScreen
import com.youhowmuch.app.ui.list.ProductListViewModel
import com.youhowmuch.app.ui.textsFor
import com.youhowmuch.app.ui.theme.YhmAppTheme
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        ApiClient.init(this)
        // 언어 = 시장: 폰 언어가 한국어면 한국 상품·원, 그 밖은 영미권 상품·달러 (웹의 브라우저 언어 판별과 같음)
        val lang = if (Locale.getDefault().language == "ko") Lang.KO else Lang.EN
        setContent {
            YhmAppTheme(dark = true) {
                val vm: ProductListViewModel = viewModel { ProductListViewModel(lang) }
                ProductListScreen(vm, lang, textsFor(lang))
            }
        }
    }
}
