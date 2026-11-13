# 로그인 · SSO API 규격

## 1. 업무 배경

- 지금까지 쇼핑몰은 비회원 주문·주문번호 조회만 있었다. 이번에 **회원 로그인**과 **SSO(소셜 로그인)** 를 붙인다.
- 작업 분담: **프론트(Next.js)는 완성**, 백엔드(Spring Boot)·DB 는 이 문서를 보고 구현한다.
- **구현 현황 (2026-11-12):** 이메일 가입·로그인·로그아웃·닉네임 변경은 백엔드까지 구현됨(`backend/.../member`). 소셜 로그인은 각사 키 발급 후 다음 단계.
- 이름은 받지 않는다. 가입 때 **겹치지 않는 닉네임을 자동 생성**(예: 포근한고래4821 / CalmWhale4821)하고, 내 계정에서 바꿀 수 있다.
- 언어 = 시장 원칙에 맞춰, 한국어 화면에는 국내 계정(카카오·네이버·Google), 영어 화면에는 영미권 계정(Google·Apple)을 보여 준다.

## 2. 분석 및 방향성

| 결정 | 이유 |
|---|---|
| **세션 쿠키(HttpOnly) 방식**, JWT를 localStorage에 두지 않음 | 스크립트로 읽을 수 없는 쿠키라 XSS로 토큰을 훔칠 수 없다. Spring Security 기본 세션을 그대로 쓰면 구현도 가장 짧다. |
| **같은 출처 프록시** (Next.js rewrites) | 프론트 `localhost:3000/api/auth/*` → 백엔드 `8080`. 쿠키가 프론트 주소에 붙어 CORS·서드파티 쿠키 차단 문제가 없다. |
| **Spring Security `oauth2Login()`** | 인가 코드 흐름, `state` 검사, PKCE 가 기본 제공된다. 직접 구현하지 않는다. |
| **CSRF: 쿠키 → 헤더** | `XSRF-TOKEN` 쿠키를 프론트가 읽어 `X-XSRF-TOKEN` 헤더로 보낸다(double-submit). 지금은 `/api/auth/**`에만 인터셉터로 검사 — Spring Security 를 통째로 켜면 기존 주문·관리자 POST 가 모두 막히기 때문. 이름이 Spring Security 관례와 같아 SSO 단계에서 옮겨도 프론트는 그대로. |
| **비밀번호 해시: PBKDF2-SHA256 60만 회** | OWASP 권장값. BCrypt 는 72바이트 초과 입력을 거부해 긴 한글 문장 비밀번호와 충돌. `spring-security-crypto` 만 추가(필터 체인 없음). |
| **비밀번호 규칙: 8자 이상, 조합 규칙 없음** | NIST SP 800-63B. 최대 64자 이상 허용, 붙여넣기 허용, 확인 칸 대신 보기 버튼. |
| **로그인 실패 문구는 하나로** | "이메일 또는 비밀번호가 맞지 않아요" — 가입 여부가 드러나지 않게. |
| **비회원 주문 유지** | 회원가입 강제는 결제 이탈의 주요 원인(Baymard). 로그인은 선택. |
| **소셜 버튼은 각사 가이드 그대로** | 색·문구·심볼을 바꾸면 심사 탈락·키 정지 사유가 된다. 모든 버튼 같은 크기, 모서리 12px(카카오 규정). |

## 3. 결과물

### 3-1. 프론트에서 만든 것

| 경로 / 파일 | 내용 |
|---|---|
| `/login` | 소셜 버튼 → "또는 이메일로" → 이메일·비밀번호·로그인 상태 유지 |
| `/signup` | 이메일·비밀번호·닉네임(추천값 미리 채움, 바꾸면 실시간 중복 확인, 🔄 다른 추천)·개인정보 동의 |
| `/auth/callback` | 소셜 로그인에서 돌아오는 곳. 성공 시 원래 보던 페이지로, 실패 시 안내 + 다시 시도 |
| `/account` | 닉네임(변경 가능)·이메일·연결된 로그인 방식·주문 조회·로그아웃 |
| 헤더 | 로그인 전 [로그인], 후에는 닉네임 첫 글자(또는 프로필 사진) |
| `next.config.ts` | `/api/auth/*`, `/oauth2/authorization/*`, `/login/oauth2/code/*` 를 백엔드로 넘김 |
| `models/api/authApi.ts`, `controllers/useAuth.ts`, `controllers/useAuthForms.ts`, `views/auth/*` | 로직·화면 |

로그인 후 돌아갈 곳은 `?next=/경로` 로 받고, 사이트 안 경로만 허용한다(오픈 리다이렉트 방지). 소셜 로그인은 출발 전에 탭 저장소(sessionStorage)에 적어 두고 콜백에서 꺼낸다.

### 3-2. 백엔드가 구현할 API

모든 응답은 JSON. 오류는 기존 `ErrorResponse` 에 **`code`** 를 추가해 `{ "code": "EMAIL_TAKEN", "message": "..." }` 형태로 준다.

#### `GET /api/auth/csrf`
- `204`. `XSRF-TOKEN` 쿠키를 내려주기만 한다. 프론트는 쿠키가 없을 때 POST 직전에 한 번 부른다.

#### `GET /api/auth/me`
- 로그인 중: `200`
```json
{
  "id": 12,
  "email": "daun@example.com",
  "nickname": "포근한고래4821",
  "avatarUrl": "https://...",
  "providers": ["password", "kakao"],
  "role": "USER"
}
```
- 비로그인: `401` (본문 없어도 됨). **로그인 페이지로 302 리다이렉트하지 말 것** — JSON API 는 `HttpStatusEntryPoint(UNAUTHORIZED)`.

#### `POST /api/auth/signup`
```json
{ "email": "daun@example.com", "password": "8자 이상", "nickname": "포근한고래4821", "agreePrivacy": true, "lang": "ko" }
```
- 성공: `201` + `me` 와 같은 본문, **가입과 동시에 로그인(세션 생성)**. `nickname` 을 비우면 `lang` 에 맞춰 자동 생성, 넣으면 형식·중복 검사(`400`/`409`).
- `400`: 이메일 형식, 비밀번호 8~128자, `agreePrivacy=true` 아닐 때
- `409 EMAIL_TAKEN`: 이미 가입된 이메일 (프론트가 이메일 칸 옆에 안내)
- 비밀번호는 `{pbkdf2}` 해시로 저장. 이메일은 소문자·trim 후 저장·비교.

#### `POST /api/auth/login`
```json
{ "email": "daun@example.com", "password": "...", "remember": true }
```
- 성공: `200` + `me` 본문. 세션 고정 공격 방지를 위해 **세션 ID 를 새로 발급**(`changeSessionId`, Spring 기본).
- `remember=true` → remember-me 쿠키(예: 14일), `false` → 브라우저 닫으면 끝.
- `401 BAD_CREDENTIALS`: 이메일 없음 / 비밀번호 틀림 **구분하지 않음**
- `429 TOO_MANY_ATTEMPTS`: 같은 이메일·IP 로 짧은 시간 연속 실패(예: 5분에 10회)

#### `GET /api/auth/nickname/suggest?lang=ko|en`
- `200 { "nickname": "포근한고래4821" }` — 가입 화면에 미리 채우는 추천 닉네임(지금 아무도 안 씀)

#### `GET /api/auth/nickname/check?nickname=...`
- `200 { "status": "AVAILABLE" | "INVALID" | "TAKEN" }` — 입력을 멈추고 0.4초 뒤 프론트가 호출

#### `PUT /api/auth/me/nickname`
```json
{ "nickname": "새닉네임" }
```
- 성공: `200` + `me` 본문. 2~20자, 한글·영문·숫자·밑줄만.
- `400` 형식 오류 / `409` 이미 쓰는 닉네임 / `401` 비로그인

#### `POST /api/auth/logout`
- `204`. 세션 무효화 + remember-me 쿠키 삭제.

#### `GET /api/auth/providers?lang=ko|en`
- 켜 둔(키가 설정된) 소셜 로그인만, 보여줄 순서대로.
```json
{ "providers": ["kakao", "naver", "google"] }
```
- 권장: `ko` → `kakao, naver, google` / `en` → `google, apple`. 키가 없는 회사는 빼고 준다.
- 이 API 가 없거나 실패하면 프론트는 위 권장 순서를 그대로 쓴다.

#### 소셜 로그인 (Spring Security 기본 경로)
| 단계 | 주소 | 비고 |
|---|---|---|
| 시작 | `GET /oauth2/authorization/{google\|kakao\|naver\|apple}` | 프론트 버튼이 이동하는 곳 |
| 콜백 | `GET /login/oauth2/code/{id}` | 각사 개발자 콘솔에 **`http://localhost:3000/login/oauth2/code/{id}`** 로 등록 (프론트 주소!) |
| 성공 | 302 → `http://localhost:3000/auth/callback` | `successHandler` |
| 실패 | 302 → `http://localhost:3000/auth/callback?error=<code>` | `failureHandler`. 코드: `access_denied`, `email_conflict`, `server_error` |

### 3-3. 계정 연결 규칙

1. 같은 `(provider, providerUserId)` 가 있으면 그 회원으로 로그인.
2. 없고, 소셜에서 받은 이메일이 **기존 회원과 같으면 자동으로 합치지 않는다** → `error=email_conflict`.
   (이메일 소유 확인이 안 된 소셜 계정으로 남의 계정에 들어가는 계정 탈취를 막기 위함.
   Google `email_verified=true` 처럼 확인된 경우에만 합쳐도 됨 — 정책 선택)
3. 둘 다 아니면 새 회원 생성(비밀번호 없음, `providers=[해당 회사]`).
4. 이후 "내 계정에서 연결하기"는 향후 계획.

### 3-4. DB 제안

```sql
-- 구현됨: backend/db/auth.sql (schema.sql 에도 포함)
CREATE TABLE member (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(254) NOT NULL UNIQUE,
  nickname      VARCHAR(30)  NOT NULL UNIQUE,  -- 자동 생성, 변경 가능
  password_hash VARCHAR(200) NULL,           -- 소셜 전용 회원은 NULL
  avatar_url    VARCHAR(500) NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'USER',
  lang          VARCHAR(5)   NOT NULL DEFAULT 'ko',
  privacy_agreed_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SSO 단계에서 추가
CREATE TABLE member_identity (
  id               BIGINT PRIMARY KEY AUTO_INCREMENT,
  member_id        BIGINT NOT NULL,
  provider         VARCHAR(20)  NOT NULL,    -- google | kakao | naver | apple
  provider_user_id VARCHAR(100) NOT NULL,
  email            VARCHAR(254) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_identity (provider, provider_user_id),
  FOREIGN KEY (member_id) REFERENCES member(id)
);

-- 회원 주문 연결 (비회원 주문은 NULL 유지)
ALTER TABLE orders ADD COLUMN member_id BIGINT NULL;
```

### 3-5. Spring 설정 예시

`build.gradle`: `spring-boot-starter-security`, `spring-boot-starter-oauth2-client`

`application.yml` (키는 git 에 넣지 말고 환경변수로)
```yaml
server:
  forward-headers-strategy: framework   # 프록시(3000) 뒤에 있다는 걸 알게
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID:}
            client-secret: ${GOOGLE_CLIENT_SECRET:}
            scope: openid, profile, email
            redirect-uri: "${FRONT_ORIGIN:http://localhost:3000}/login/oauth2/code/{registrationId}"
          kakao:
            client-id: ${KAKAO_REST_API_KEY:}
            client-secret: ${KAKAO_CLIENT_SECRET:}
            client-authentication-method: client_secret_post
            authorization-grant-type: authorization_code
            scope: profile_nickname, profile_image, account_email
            redirect-uri: "${FRONT_ORIGIN:http://localhost:3000}/login/oauth2/code/{registrationId}"
            client-name: Kakao
          naver:
            client-id: ${NAVER_CLIENT_ID:}
            client-secret: ${NAVER_CLIENT_SECRET:}
            authorization-grant-type: authorization_code
            scope: name, email, profile_image
            redirect-uri: "${FRONT_ORIGIN:http://localhost:3000}/login/oauth2/code/{registrationId}"
            client-name: Naver
        provider:
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id
          naver:
            authorization-uri: https://nid.naver.com/oauth2.0/authorize
            token-uri: https://nid.naver.com/oauth2.0/token
            user-info-uri: https://openapi.naver.com/v1/nid/me
            user-name-attribute: response   # 네이버는 응답이 response 안에 들어 있음
```
- Google 은 Spring 이 provider 정보를 이미 알고 있어 `provider` 칸이 필요 없다.
- **Apple** 은 `client_secret` 을 개인키로 서명한 JWT 로 매번 만들어야 하고, 사용자 정보가 첫 로그인 때 한 번만 POST 로 온다(`response_mode=form_post`). 유료 개발자 계정도 필요하다. 영어 시장 오픈 때 별도로 붙이고, 그 전에는 `/api/auth/providers` 에서 빼 두면 된다.

`SecurityConfig` 핵심
```java
http
  .csrf(c -> c
      .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
      .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler()))   // Spring Security 문서의 SPA 예제 클래스
  .authorizeHttpRequests(a -> a
      .requestMatchers("/api/admin/**").hasRole("ADMIN")
      .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
      .anyRequest().permitAll())
  .exceptionHandling(e -> e.defaultAuthenticationEntryPointFor(
      new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), new AntPathRequestMatcher("/api/**")))
  .oauth2Login(o -> o
      .userInfoEndpoint(u -> u.userService(socialUserService))       // 3-3 계정 연결 규칙
      .successHandler((req, res, auth) -> res.sendRedirect(front + "/auth/callback"))
      .failureHandler((req, res, ex) -> res.sendRedirect(front + "/auth/callback?error=" + codeOf(ex))))
  .rememberMe(r -> r.key(env("REMEMBER_ME_KEY")).tokenValiditySeconds(14 * 24 * 3600))
  .logout(l -> l.logoutUrl("/api/auth/logout")
      .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)));
```
- 세션 쿠키: `HttpOnly`, `SameSite=Lax`, 운영(https)에서는 `Secure`.
- `SpaCsrfTokenRequestHandler` 와 쿠키를 매 응답에 내려주는 필터는 Spring Security 공식 문서 「Single-Page Applications」 예제를 그대로 쓰면 된다.
- 기존 관리자 화면 보호 방식이 있다면 `ADMIN` 역할로 옮기는 것은 별도 작업.

### 3-6. 버튼 심볼 파일 (`frontend/public/sso/`)

각사 가이드상 **직접 그린 아이콘은 쓸 수 없어서**, 공식 배포 파일을 받아 아래 이름으로 넣는다. 파일이 없으면 심볼 자리만 비고 버튼은 동작한다.

| 파일 | 받는 곳 |
|---|---|
| `google.svg` | Google Identity 「Sign in with Google Branding Guidelines」 다운로드 묶음의 "G" 로고 |
| `kakao.svg` | 카카오 디벨로퍼스 → 도구 → 리소스 다운로드 → 카카오 로그인 (말풍선 심볼) |
| `naver.svg` | 네이버 개발자센터 → 네이버 로그인 → 디자인 가이드 / 리소스 |
| `apple.svg` | Apple 「Sign in with Apple」 Human Interface Guidelines 리소스 |

PNG 로 받았다면 `lib/auth/providers.ts` 의 `providerIcon` 확장자만 바꾸면 된다.

## 4. 향후 계획

1. **백엔드 구현** — 위 3-2 API, 3-4 테이블, 3-5 설정. 끝나면 같이 화면에서 확인.
2. **비밀번호 재설정** — 메일 발송 수단이 정해지면 `/forgot-password` 화면과 토큰 API 추가.
3. **내 계정에서 소셜 연결·해제**, 회원 탈퇴.
4. **회원 주문 연결** — 로그인 상태로 주문하면 `orders.member_id` 저장, 내 계정에서 주문 목록. 결제 화면 이름·연락처 자동 채움.
5. **커뮤니티 연동** — 로그인 회원은 닉네임·비밀번호 없이 글쓰기(비회원 방식은 유지).
6. **Apple 로그인** — 영어 시장 오픈 시.
7. 알려진 제약: 네이버 공식 버튼(초록 바탕 흰 글자)은 명도 대비가 WCAG 4.5:1 에 못 미친다. 브랜드 규정이라 색은 그대로 두고, 같은 문구를 화면낭독기도 읽도록 텍스트 레이블을 유지했다.
