# I sell a store

샘플 상품으로 완성해 두고, 고객 요청·사이트 판매 시 **브랜드·상품·디자인·기능을 설정만으로 바꿔 납품**하는 쇼핑몰 템플릿.
상품 상세 옆에 **관련 유튜브 리뷰 영상 패널**이 붙는다.

```
I_sell_a_store/
├── backend/    Spring Boot 3.5 (내장 Tomcat) · Java 21 · JPA · MySQL 8 (기본) / H2 / PostgreSQL
└── frontend/   Next.js 15 (App Router) · CSS Modules · Zustand(장바구니)
```

### 코드 구조 (역할별 분리)

**백엔드** — 기능별 폴더 안을 계층으로 나눔
```
com.isellastore
├── global/      config(설정) · error(공통 예외 → 응답) · health(DB 상태)
├── site/        controller · dto                       브랜드·기능 구성
├── product/     controller · service · repository · domain · dto
├── order/       controller · service · repository · domain · dto
├── youtube/     controller · service · repository · domain · dto · client(유튜브 API)
├── seed/        controller · service                   데모 상품
├── admin/       repository · domain                    관리자 계정
└── payment/     PaymentGateway(결제사 어댑터) · MockPaymentGateway
```
- **controller**: 요청 받기 → 서비스 호출 → 응답 (로직 없음)
- **service**: 업무 로직·트랜잭션
- **repository**: DB 조회·저장
- **domain**: 엔티티(테이블과 1:1)
- **dto**: 요청·응답 모양
- 오류는 서비스가 `ApiException`을 던지면 `GlobalExceptionHandler`가 `{status, message}`로 응답

**프론트엔드** — M·V·C + HTML/CSS 분리
```
frontend/
├── app/            라우트(페이지) — views 를 조립만 한다
├── models/         M  types.ts(데이터 모양) · api/(백엔드 호출)
├── controllers/    C  use*.ts 훅(상태·로직: 장바구니, 옵션 선택, 주문서, 관리자 …)
├── views/          V  화면 컴포넌트(마크업) + 같은 이름의 *.module.css(스타일)
│   ├── ui/         Button · Field · Card · Badge · Section · QuantityStepper …
│   ├── layout/     Header · Footer · CategoryNav · SearchBox · CartLink · LanguageSwitcher
│   ├── home/  product/  youtube/  cart/  checkout/  order/  community/  admin/
├── lib/            순수 계산(가격 범위·옵션 조합·포맷) · i18n/(언어 감지·사전·포맷)
├── docs/           market-api.md (언어별 시장·영상 모아보기 규격) · auth-api.md (로그인·SSO) · community-api.md · ux-guidelines.md
└── styles/         tokens.css(색·간격·모서리·그림자·서체 — 고객별 디자인은 여기만 수정) · globals.css(리셋)
```

### 리뷰 영상별 모아보기 (`/videos`)
- 같은 영상에서 나온 상품을 한 페이지로 묶고, 선택·전체 **한번에 담기** (옵션 상품은 상품 페이지로 안내)
- 정렬: 영상 조회수순 · **유튜버 인기순(채널 전체 조회수)** · 최신순 / 검색: 영상 제목 · **유튜버 이름**
- 홈 "새로 들어온 상품"은 영상당 1개만, 상품 목록에도 리뷰 조회수순·유튜버 인기순 정렬
- 상품은 **1이미지 1상품** (관리자 화면에서 같은 이미지 중복 저장 차단)

### 다국어 (한국어 / English)
- **언어 = 시장**: EN 이면 영미권 대상 상품, 영문 상품명·설명, 영어권 유튜버 영상이 나온다 (모든 요청에 `lang`, 규격 `frontend/docs/market-api.md`)
- 언어 결정 순서: 헤더 `한 / EN` 토글로 고른 값(쿠키 `lang`) → 브라우저 언어(한국어면 ko, 그 밖은 en) → ko
- 문구는 `lib/i18n/dictionaries.ts` 한 곳에 있다. `en` 은 `ko` 와 같은 키를 갖도록 타입으로 강제된다
- 서버 컴포넌트는 `getI18n()`, 클라이언트 컴포넌트는 `useI18n()` 로 같은 모양(`t`, `price`, `views`, `category` …)을 받는다
- 가격은 원화 그대로 표기만 바꾼다 (`38,000원` / `₩38,000`). 카테고리는 slug 로 번역, 상품명·설명은 DB 값 그대로
- 관리자 화면은 내부 도구라 한국어만

### 커뮤니티 (`/community`)
- 게시판: 구매 후기 · 질문 · 자유 / 목록·상세·글쓰기·댓글·좋아요·비밀번호 삭제
- 글은 DB(백엔드 API)에서만 온다. 백엔드는 `frontend/docs/community-api.md` 규격으로 별도 구현
- 백엔드가 없으면 목록은 "다시 시도" 안내, 홈의 최근 글 영역은 숨김

### 로그인 · SSO (`/login`, `/signup`, `/account`)
- 이메일 가입·로그인 + 소셜 로그인 (한국어: 카카오·네이버·Google / 영어: Google·Apple)
- 세션은 백엔드 HttpOnly 쿠키. `next.config.ts` rewrites 로 `/api/auth/*`·`/oauth2/*` 를 백엔드에 넘겨 같은 출처로 동작
- 비회원 주문은 그대로 가능. 백엔드는 `frontend/docs/auth-api.md` 규격으로 구현
- 소셜 버튼 심볼은 각사 공식 파일을 `frontend/public/sso/` 에 넣어 사용 (받는 곳은 규격 문서 3-6)

---

## 1. 실행 방법

### 준비물
- JDK 21, Maven (또는 IntelliJ IDEA — Maven 내장)
- Node.js 20 이상
- MySQL 8.0 (서비스 실행 중, root 비밀번호 설정 완료)
- YouTube Data API v3 키 (없어도 실행은 됨, 영상 패널만 비어 있음)

### MySQL 준비 (DB: `my_db`)
- **테이블 구조의 기준은 `backend/db/schema.sql`** (v2 정규화, 테이블 15개). Workbench에서 한 번 실행한다.
- 백엔드는 `ddl-auto=validate`라서 모델과 테이블이 다르면 시작하지 않고 어디가 다른지 알려준다.
- DB 계정은 `backend/config/application.yml` (로컬 개발용 root/root, 일부러 깃에 포함 — 파일 안 설명 참고).
- 전용 계정을 쓰려면 `backend/db/mysql-setup.sql` 실행.
- 이미 만든 DB에 기능만 추가할 때 (기존 데이터 유지, 각 1회): `auth.sql`(회원) · `sourcing.sql`(유튜브 상품 수집) · `market.sql`(한국/영미권 시장)

```
category ─< product ─┬─< product_attribute                 사양 (소재, 원산지)
                     ├─< product_option ─< product_option_value   옵션 (색상: 블랙/화이트)
                     ├─< product_variant ─< variant_option_value  조합별 재고·추가금 (블랙+M)
                     ├── product_youtube_setting           검색어·숨김
                     └─< product_video >── youtube_video   영상 고정·제외·순위 / 영상 정보(공유)
orders ─┬── order_shipping   받는 분·연락처·우편번호·주소1·주소2
        ├─< order_item       주문 당시 상품명·옵션·단가 보관
        └─< payment          결제 시도 이력
admin_user                   관리자 계정 (BCrypt)
```

### 백엔드 (http://localhost:8080)
```powershell
cd backend
$env:YOUTUBE_API_KEY="발급받은_키"     # PowerShell 기준 (DB 계정은 config/application.yml)
mvn spring-boot:run
```
- STS/IntelliJ: `IsellastoreApplication` 실행 (Working directory = backend 폴더)
- 연결 확인: http://localhost:8080/api/health/db
- 연결·모델 테스트: `DbConnectionTest` (JUnit)
- MySQL 없이 테스트만 할 때: `SPRING_PROFILES_ACTIVE=h2` (backend/data 폴더에 파일 DB 생성)

### 프론트엔드 (http://localhost:3000)
```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

---

## 2. 데모 상품 만들기 (유튜브 인기 리뷰 → 상품 등록)

카테고리 후보(`backend/src/main/resources/demo/candidates.json`)마다 유튜브를 **조회수순**으로 검색하고,
리뷰 영상 조회수가 높은 후보부터 카테고리별 상위 N개를 상품으로 등록한다. 검색 결과는 그대로 영상 캐시에 저장되어 사이드 패널에 바로 표시된다.

```powershell
# 1) 순위만 미리 보기 (등록 안 함)
curl.exe -X POST "http://localhost:8080/api/admin/seed/demo?perCategory=4&dryRun=true"

# 2) 실제 등록
curl.exe -X POST "http://localhost:8080/api/admin/seed/demo?perCategory=4"

# 데모 상품 전체 내리기 (납품 전 고객 상품으로 교체할 때)
curl.exe -X DELETE "http://localhost:8080/api/admin/seed/demo"
```

> ⚠️ 후보 1개 = 유튜브 검색 1회. 기본 후보 24개 → 24회. 유튜브 검색은 **프로젝트당 하루 100회**가 기본 한도이므로 dryRun과 실제 등록을 같은 날 여러 번 반복하지 말 것.

### 2-1. 유튜브 소개 제품 수집 (한국 + 영미권 유튜버 → 데모 상품)

검색어별로 유튜브를 페이지마다 이어서 검색하고, **영상 설명란에 적힌 제품 목록**을 상품으로 등록한다 (사진 = 영상 썸네일, 영상 = 상품 영상 패널).

| | 한국 유튜버 (`lang=ko`) | 영미권 유튜버 (`lang=en`) |
|---|---|---|
| 검색어 | "패션 추천템", "디지털 리뷰" … | "fashion haul", "tech review" … |
| 유튜브 검색 | `regionCode=KR`, `relevanceLanguage=ko` | `regionCode=US`, `relevanceLanguage=en` |
| 상품 시장 | `markets = KR` (한국어 화면에 노출) | `markets = US` (영어 화면에 노출, `nameEn`) |
| 설명란 가격 | 129,000원 / 12만9천원 | $29.99 → 원화 환산(`USD_KRW_RATE`, 기본 1400) |

- 판매가 규칙(원화): 1만원 미만 100원 단위 올림 · 1만원 이상 1,000원 단위 올림 · 딱 떨어지면 +1,000원
- 가격 없이 쇼핑 링크만 있는 제품은 **테스트 가격 7,701원** (`priceSource = TEST`, 나중에 가격 채울 대상)
- 상품 목록·검색(`/api/products`)과 수집 목록(`/api/sourced-products`)은 `lang` 시장 상품만 돌려준다

```powershell
curl.exe -X POST "http://localhost:8080/api/admin/sourcing/start"            # 한국·영미권 번갈아, 할당량 끝날 때까지
curl.exe -X POST "http://localhost:8080/api/admin/sourcing/start?lang=en"    # 영미권 유튜버만 (?maxSearches=2 로 시험)
curl.exe "http://localhost:8080/api/admin/sourcing/status"                   # 진행 상황
curl.exe -X POST "http://localhost:8080/api/admin/sourcing/stop"             # 중단 (등록된 상품 유지)
curl.exe "http://localhost:8080/api/sourced-products?lang=en"                # 프론트용 사진 + 정보 목록
curl.exe "http://localhost:8080/api/admin/sourcing/items"                    # 관리자: 가격 출처·원래 금액·통화
```

> 다시 시작하면 검색어별로 멈춘 페이지부터 이어서 한다 (`sourcing_cursor`, 처음부터: `&fromBeginning=true`).
> 검색 1페이지 = 100 units, 하루 기본 10,000 units ≈ 100페이지. 매일 17시(KST) 초기화. 다 쓰면 그날은 영상 자동 갱신·관리자 재검색도 안 된다.
> API 키는 환경변수 또는 `C:/keydata/youtube.py`(`youtubekey = …`, 다른 폴더면 `KEY_DIR`)에서 자동으로 읽는다.

---

## 3. 유튜브 영상 패널 동작 원칙

| 원칙 | 구현 |
|---|---|
| 방문자 조회로 검색 한도를 쓰지 않음 | `GET /api/products/{id}/videos`는 DB 캐시만 읽음 |
| 검색은 정해진 때만 | 상품 등록 시 1회 + 매일 04:30 스케줄러(하루 예산 `daily-refresh-budget`) |
| 30일 보관 상한 | 30일 넘은 검색 결과는 스케줄러가 비움, 7일 지나면 갱신 대상 |
| 누르기 전엔 플레이어 미로드 | 썸네일 목록 → [실행하기] 클릭 시 iframe 생성 |
| 관리자 큐레이션 | 영상 고정·제외·패널 숨김 API |

### 관리자 화면 — http://localhost:3000/admin
`frontend/.env.local`에 `NEXT_PUBLIC_ENABLE_ADMIN=true`일 때만 열린다.
- 상품 등록·수정·판매중지 (등록 시 유튜브 검색 1회로 영상 목록 자동 생성)
- 사양 행 편집, 옵션 입력(선택지 쉼표 구분) → **조합 표 자동 생성** (조합별 추가금·재고·SKU·판매여부)
- 상품별 영상: 검색 결과 보기, **고정 / 제외**, 영상 주소로 직접 고정, 패널 숨기기, 다시 검색

### 쇼핑몰 화면
- 떠 있는 캡슐 헤더: 검색창(`/products?q=`), 커뮤니티, 주문조회, 한/EN 토글, 모바일 카테고리 가로 스크롤
- 목록: 정렬(최신·가격·이름), 품절 표시, 옵션 상품은 최저가 "~" 표시
- 상세: 경로 표시, 사양 표, **옵션 버튼 선택**(재고 없는 조합은 흐리게), 선택 조합 가격·재고, 같은 카테고리 상품, 우측 유튜브 패널
- 장바구니: 상품+옵션 조합 단위
- 주문서: 받는 분·연락처·우편번호·기본주소·상세주소·요청사항, 결제수단(모의)
- 주문조회(`/orders`): **주문번호 + 연락처**가 맞아야 조회 (주문번호만으로 개인정보 노출 안 됨)

관리자 API (⚠️ 아직 인증 없음 — 운영 서버에 공개하기 전 Spring Security 추가 필요)
```
GET  /api/products?category=&q=&sort=            목록 (sort: new|priceAsc|priceDesc|name)
GET  /api/products/{id}/related                  같은 카테고리 상품
POST /api/orders                                 주문서 생성 {shipping:{...}, items:[{productId, variantId, quantity}]}
POST /api/orders/{orderNo}/pay                   결제 (재고 원자적 차감 → 모의 결제)
GET  /api/orders/{orderNo}?phone=                주문 조회 (연락처 일치 시에만)
GET  /api/admin/products                         관리자 목록 (판매중지 포함)
POST /api/admin/products/{id}/activate           판매 재개
GET  /api/admin/products/{id}/videos             영상 관리 정보 (검색 원본·고정·제외)
POST /api/admin/products                         상품 등록 (등록 시 영상 캐시 자동 생성)
PUT  /api/admin/products/{id}                    상품 수정
DELETE /api/admin/products/{id}                  상품 내리기
POST /api/admin/products/{id}/videos/refresh     영상 다시 검색 (검색 1회 소모)
PUT  /api/admin/products/{id}/videos/curation    {"pinnedVideoIds":[], "excludedVideoIds":[], "hidden":false}
```

---

## 4. 납품 시 바꾸는 곳 (커스터마이징 체크리스트)

| 항목 | 바꾸는 곳 | 코드 수정 |
|---|---|---|
| 상호·문구·연락처·사업자 정보 | 환경변수 `BRAND_*` (`backend/.env.example` 참고) | 없음 |
| 대표 색상·강조 색상 | `BRAND_PRIMARY_COLOR`, `BRAND_ACCENT_COLOR` | 없음 |
| 그 밖의 디자인(글꼴·간격·모서리·그림자·배경색) | `frontend/styles/tokens.css` | CSS 변수만 |
| 화면 문구·영어 번역 | `frontend/lib/i18n/dictionaries.ts` | 사전만 |
| 로고 | `BRAND_LOGO_URL` | 없음 |
| 기능 켜고 끄기 | `FEATURE_CART`, `FEATURE_PAYMENT`, `FEATURE_YOUTUBE_PANEL` | 없음 |
| 데모 상품 후보 | `demo/candidates.json` | 없음 |
| 유튜브 | **고객 명의 Google Cloud 프로젝트**에서 키 발급 → `YOUTUBE_API_KEY` | 없음 |
| 실제 결제 | `PaymentGateway` 구현체 추가 (포트원/토스) | 구현체 1개 |
| DB | `SPRING_PROFILES_ACTIVE` (mysql/postgres) + `DB_URL`·`DB_USERNAME`·`DB_PASSWORD` | 없음 |

---

## 5. 다음 작업
- [x] 관리자 화면(상품·옵션·조합·영상 큐레이션)
- [x] DB 정규화(v2), 재고 동시성, 주문 조회 개인정보 보호
- [ ] 관리자 로그인(세션 쿠키 + CSRF), 요청 횟수 제한, DB 전용계정, 보안 헤더
- [ ] PWA(앱 설치), 아이폰 설치 안내, 애플페이 버튼
- [ ] 주문 관리 화면
- [ ] 상품 CSV 일괄 등록
- [ ] 회원가입·로그인, 주문 내역
- [x] 부드러운 디자인 시스템(라운드·면 중심), 한/영 인터페이스, 커뮤니티 화면(프론트)
- [ ] 커뮤니티 백엔드 연결, 상품명·설명 영어 필드
- [ ] 테마 프리셋

---

## 연락처
- 이메일: [naluteo89@gmail.com](mailto:naluteo89@gmail.com)
