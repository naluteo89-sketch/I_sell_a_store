# I sell a store

샘플 상품으로 완성해 두고, 고객 요청·사이트 판매 시 **브랜드·상품·디자인·기능을 설정만으로 바꿔 납품**하는 쇼핑몰 템플릿.
상품 상세 옆에 **관련 유튜브 리뷰 영상 패널**이 붙는다.

```
I_sell_a_store/
├── backend/                 Spring Boot 3.5 · Java 21 · JPA · MySQL 8 (기본) / H2 / PostgreSQL
│   ├── config/              이 컴퓨터 전용 설정 (DB 비밀번호 등, 깃 제외)
│   ├── db/                  schema.sql(테이블 구조) · mysql-setup.sql(전용 계정)
│   └── src/main/java/com/isellastore/
│       ├── config/          StoreProperties(납품 설정값) · WebConfig(CORS)
│       ├── site/            /api/site(브랜드·기능) · /api/health/db(DB 확인)
│       ├── product/         상품·카테고리 (방문자 API + 관리자 API)
│       ├── order/           주문·결제 처리
│       ├── payment/         결제사 어댑터 (지금은 모의 결제)
│       ├── youtube/         유튜브 검색·영상 캐시·매일 갱신 스케줄러
│       └── seed/            카테고리 초기화 · 데모 상품 생성
└── frontend/                Next.js 15 (App Router) · Tailwind CSS 4 · Zustand(장바구니)
    ├── app/                 페이지 (홈 · 상품 목록/상세 · 장바구니 · 주문서 · 주문 완료)
    ├── components/          화면 조각 (헤더 · 상품 카드/목록 · 유튜브 패널 등)
    └── lib/                 API 호출 · 장바구니 저장소 · 금액 표시 · 공통 훅
```

---

## 1. 실행 방법

### 준비물
- JDK 21, Maven (또는 IntelliJ IDEA — Maven 내장)
- Node.js 20 이상
- MySQL 8.0 (서비스 실행 중, root 비밀번호 설정 완료)
- YouTube Data API v3 키 (없어도 실행은 됨, 영상 패널만 비어 있음)

### MySQL 준비
- `my_db` DB는 서버 첫 실행 때 **자동 생성**되고 테이블도 자동으로 만들어진다.
- 전용 계정을 쓰려면 `backend/db/mysql-setup.sql`을 MySQL Command Line Client에서 실행.

### 백엔드 (http://localhost:8080)
```powershell
cd backend
$env:DB_PASSWORD="MySQL_root_비밀번호"     # PowerShell 기준
$env:YOUTUBE_API_KEY="발급받은_키"
mvn spring-boot:run
```
- IntelliJ: `IsellastoreApplication` 실행 → Run Configuration의 Environment variables에
  `DB_PASSWORD=...;YOUTUBE_API_KEY=...` 입력
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

---

## 3. 유튜브 영상 패널 동작 원칙

| 원칙 | 구현 |
|---|---|
| 방문자 조회로 검색 한도를 쓰지 않음 | `GET /api/products/{id}/videos`는 DB 캐시만 읽음 |
| 검색은 정해진 때만 | 상품 등록 시 1회 + 매일 04:30 스케줄러(하루 예산 `daily-refresh-budget`) |
| 30일 보관 상한 | 30일 넘은 검색 결과는 스케줄러가 비움, 7일 지나면 갱신 대상 |
| 누르기 전엔 플레이어 미로드 | 썸네일 목록 → [실행하기] 클릭 시 iframe 생성 |
| 관리자 큐레이션 | 영상 고정·제외·패널 숨김 API |

관리자 API (⚠️ 아직 인증 없음 — 운영 서버에 공개하기 전 Spring Security 추가 필요)
```
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
| 로고 | `BRAND_LOGO_URL` | 없음 |
| 기능 켜고 끄기 | `FEATURE_CART`, `FEATURE_PAYMENT`, `FEATURE_YOUTUBE_PANEL` | 없음 |
| 데모 상품 후보 | `demo/candidates.json` | 없음 |
| 유튜브 | **고객 명의 Google Cloud 프로젝트**에서 키 발급 → `YOUTUBE_API_KEY` | 없음 |
| 실제 결제 | `PaymentGateway` 구현체 추가 (포트원/토스) | 구현체 1개 |
| DB | `SPRING_PROFILES_ACTIVE` (mysql/postgres) + `DB_URL`·`DB_USERNAME`·`DB_PASSWORD` | 없음 |

---

## 5. 다음 작업
- [ ] 관리자 화면(상품·주문·영상 큐레이션) + 관리자 인증
- [ ] 상품 CSV 일괄 등록
- [ ] 회원가입·로그인, 주문 내역
- [ ] Shadcn UI 컴포넌트 적용, 테마 프리셋
