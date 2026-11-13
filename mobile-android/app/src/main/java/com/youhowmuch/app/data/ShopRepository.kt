package com.youhowmuch.app.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class ApiException(message: String, val status: Int = 0) : Exception(message)

/** 웹 models/api 폴더의 호출과 같은 엔드포인트. 모든 방문자용 요청에 lang 을 붙인다 */
class ShopRepository(private val lang: Lang) {
    private val api = ApiClient
    private val jsonType = "application/json".toMediaType()

    private fun url(path: String, vararg params: Pair<String, Any?>) =
        (api.baseUrl + path).toHttpUrl().newBuilder().apply {
            params.forEach { (k, v) -> if (v != null && v.toString().isNotEmpty()) addQueryParameter(k, v.toString()) }
            addQueryParameter("lang", lang.code)
        }.build()

    private suspend fun <T> call(request: Request, parse: (String, okhttp3.Headers) -> T): T = withContext(Dispatchers.IO) {
        try {
            api.http.newCall(request).execute().use { res ->
                if (!res.isSuccessful) throw ApiException(api.errorMessage(res), res.code)
                parse(res.body?.string().orEmpty(), res.headers)
            }
        } catch (e: ApiException) {
            throw e
        } catch (e: java.io.IOException) {
            throw ApiException("서버에 연결할 수 없어요. 백엔드(${api.baseUrl})가 켜져 있는지 확인해 주세요.")
        }
    }

    /** 상품 목록 한 페이지. 정렬·검색·페이지 나눔은 백엔드 SQL 이 한다 */
    suspend fun products(page: Int, size: Int = 20, sort: ProductSort = ProductSort.NEW, category: String? = null, q: String? = null): Page<Product> {
        val u = url(
            "/api/products",
            "page" to page.takeIf { it > 1 }, "size" to size, "category" to category, "q" to q,
            "sort" to sort.query.takeIf { sort != ProductSort.NEW },
        )
        return call(Request.Builder().url(u).build()) { body, headers ->
            val items = api.json.decodeFromString(ListSerializer(Product.serializer()), body.ifEmpty { "[]" })
            Page(items, headers["X-Total-Count"]?.toIntOrNull() ?: items.size)
        }
    }

    suspend fun product(id: Long): Product =
        call(Request.Builder().url(url("/api/products/$id")).build()) { body, _ -> api.json.decodeFromString(Product.serializer(), body) }

    suspend fun videos(productId: Long): List<Video> =
        call(Request.Builder().url(url("/api/products/$productId/videos")).build()) { body, _ ->
            api.json.decodeFromString(ListSerializer(Video.serializer()), body.ifEmpty { "[]" })
        }

    // ───────── 로그인 (규격: frontend/docs/auth-api.md) ─────────

    private suspend fun ensureCsrf() {
        val u = (api.baseUrl + "/api/auth/csrf").toHttpUrl()
        if (api.cookies.find(u, "XSRF-TOKEN") == null) call(Request.Builder().url(u).build()) { _, _ -> }
    }

    /** 로그인 안 했으면 null */
    suspend fun me(): AuthUser? = try {
        call(Request.Builder().url("${api.baseUrl}/api/auth/me").build()) { body, _ -> api.json.decodeFromString(AuthUser.serializer(), body) }
    } catch (e: ApiException) {
        if (e.status == 401) null else throw e
    }

    suspend fun login(email: String, password: String, remember: Boolean): AuthUser {
        ensureCsrf()
        val body = buildJsonObject { put("email", email); put("password", password); put("remember", remember) }.toString()
        val req = Request.Builder().url("${api.baseUrl}/api/auth/login").post(body.toRequestBody(jsonType)).build()
        return call(req) { res, _ -> api.json.decodeFromString(AuthUser.serializer(), res) }
    }

    suspend fun logout() {
        ensureCsrf()
        call(Request.Builder().url("${api.baseUrl}/api/auth/logout").post(ByteArray(0).toRequestBody()).build()) { _, _ -> }
    }
}
