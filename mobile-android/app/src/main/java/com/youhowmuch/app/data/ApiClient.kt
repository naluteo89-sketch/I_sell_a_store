package com.youhowmuch.app.data

import android.content.Context
import com.youhowmuch.app.BuildConfig
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import java.util.concurrent.TimeUnit

/**
 * 백엔드 공통 연결.
 * - 세션 로그인(HttpOnly JSESSIONID)과 로그인 유지 쿠키를 앱 저장소에 보관 → 앱을 다시 켜도 로그인 유지
 * - CSRF: XSRF-TOKEN 쿠키 값을 X-XSRF-TOKEN 헤더로 보냄 (웹과 같은 double-submit, /api/auth 아래 주소만 검사)
 */
object ApiClient {
    val baseUrl: String = BuildConfig.API_BASE.trimEnd('/')

    val json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
        coerceInputValues = true
    }

    lateinit var cookies: PersistentCookieJar
        private set
    lateinit var http: OkHttpClient
        private set

    fun init(context: Context) {
        if (::http.isInitialized) return
        cookies = PersistentCookieJar(context.applicationContext)
        http = OkHttpClient.Builder()
            .cookieJar(cookies)
            .addInterceptor(CsrfHeader(cookies))
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    /** 백엔드 ErrorResponse { status, message } 의 message 를 그대로 보여준다 */
    fun errorMessage(res: Response): String {
        val body = runCatching { res.body?.string().orEmpty() }.getOrDefault("")
        val msg = runCatching { json.parseToJsonElement(body).jsonObject["message"]?.jsonPrimitive?.content }.getOrNull()
        return msg ?: "요청 실패 (${res.code})"
    }
}

/** 변경 요청(POST·PUT·DELETE)에 CSRF 헤더 자동 첨부 */
private class CsrfHeader(private val jar: PersistentCookieJar) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val req = chain.request()
        if (req.method == "GET" || req.method == "HEAD") return chain.proceed(req)
        val token = jar.find(req.url, "XSRF-TOKEN") ?: return chain.proceed(req)
        return chain.proceed(req.newBuilder().header("X-XSRF-TOKEN", token).build())
    }
}

/**
 * 쿠키를 SharedPreferences 에 저장. 만료된 쿠키는 버린다.
 * (개발용 로컬 서버 기준. 배포 때는 EncryptedSharedPreferences 등으로 교체 검토)
 */
class PersistentCookieJar(context: Context) : CookieJar {
    private val prefs = context.getSharedPreferences("cookies", Context.MODE_PRIVATE)
    private val store = mutableMapOf<String, Cookie>() // key = domain|path|name

    init {
        val base = okhttp3.HttpUrl.Builder().scheme("http").host("localhost").build()
        prefs.all.forEach { (key, value) ->
            val c = (value as? String)?.let { Cookie.parse(urlFor(it) ?: base, it) }
            if (c != null && c.expiresAt > System.currentTimeMillis()) store[key] = c
        }
    }

    private fun urlFor(raw: String): HttpUrl? {
        val domain = Regex("(?i)domain=([^;]+)").find(raw)?.groupValues?.get(1)?.trim() ?: return null
        return HttpUrl.Builder().scheme("http").host(domain.removePrefix(".")).build()
    }

    private fun key(c: Cookie) = "${c.domain}|${c.path}|${c.name}"

    @Synchronized
    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        val edit = prefs.edit()
        for (c in cookies) {
            val k = key(c)
            if (c.expiresAt <= System.currentTimeMillis()) {
                store.remove(k); edit.remove(k)
            } else {
                store[k] = c
                // domain 속성이 없는 쿠키도 복원할 수 있게 domain 을 붙여 저장
                edit.putString(k, if (c.toString().contains("domain=", true)) c.toString() else "${c}; domain=${c.domain}")
            }
        }
        edit.apply()
    }

    @Synchronized
    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        val now = System.currentTimeMillis()
        return store.values.filter { it.expiresAt > now && it.matches(url) }
    }

    @Synchronized
    fun find(url: HttpUrl, name: String): String? = loadForRequest(url).firstOrNull { it.name == name }?.value

    @Synchronized
    fun clear() {
        store.clear(); prefs.edit().clear().apply()
    }
}
