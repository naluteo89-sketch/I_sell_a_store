package com.youhowmuch.app.ui.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.youhowmuch.app.data.Lang
import com.youhowmuch.app.data.Product
import com.youhowmuch.app.data.ProductSort
import com.youhowmuch.app.data.ShopRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ProductListState(
    val items: List<Product> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val sort: ProductSort = ProductSort.NEW,
    val loading: Boolean = true,
    val error: String? = null,
) {
    val hasNext: Boolean get() = page * PAGE_SIZE < total
    companion object { const val PAGE_SIZE = 20 }
}

/** 상품 목록: 20개씩 서버에서 잘라 받는다 (웹은 40개, 폰은 화면이 작아 절반) */
class ProductListViewModel(lang: Lang) : ViewModel() {
    private val repo = ShopRepository(lang)
    private val _state = MutableStateFlow(ProductListState())
    val state: StateFlow<ProductListState> = _state.asStateFlow()
    private var job: Job? = null

    init { load(1) }

    fun load(page: Int, sort: ProductSort = _state.value.sort) {
        job?.cancel()
        _state.update { it.copy(loading = true, error = null, page = page, sort = sort) }
        job = viewModelScope.launch {
            runCatching { repo.products(page, ProductListState.PAGE_SIZE, sort) }
                .onSuccess { p -> _state.update { it.copy(items = p.items, total = p.total, loading = false) } }
                .onFailure { e -> _state.update { it.copy(loading = false, error = e.message) } }
        }
    }

    fun next() { if (_state.value.hasNext) load(_state.value.page + 1) }
    fun prev() { if (_state.value.page > 1) load(_state.value.page - 1) }
}
