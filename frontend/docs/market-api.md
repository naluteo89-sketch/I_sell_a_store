# 언어별 시장·리뷰 영상 모아보기 API 규격 (프론트 ↔ 백엔드)

## 1. 업무 배경
- 언어 버튼(한/EN)을 눌러도 문구만 바뀌면 의미가 없다. 영어 화면에는 **영미권 대상 상품**과 **영어권 유튜버 리뷰**가 나와야 한다.
- 데모 상품을 리뷰 영상 기준으로 모으다 보니 **같은 영상에서 나온 상품이 목록을 도배**했다. 영상별로 묶어 보여주고, 그 영상 상품을 **한번에 담기**할 수 있어야 한다.
- 정렬은 영상 조회수만이 아니라 **유튜버(채널) 인기순**도 필요하고, 검색은 **유튜버 이름**으로도 되어야 한다.
- 상품 이미지는 **1이미지 1상품**(상품마다 대표 이미지 1장, 다른 상품과 중복 금지)으로 관리한다.

## 2. 분석 및 방향성
- **언어 = 시장**: 프론트는 모든 방문자용 요청에 `lang=ko|en` 을 붙인다. 백엔드는 이 값 하나로 상품 노출·번역·영상 언어를 결정한다.

  | lang | 시장 | 상품 노출 | 상품명·설명 | 유튜브 검색 |
  |---|---|---|---|---|
  | `ko` | 한국 `KR` | markets 에 KR 포함 | 한국어 | `relevanceLanguage=ko`, `regionCode=KR`, 검색어 = youtubeKeyword (기본 "상품명 리뷰") |
  | `en` | 영미권 `US` | markets 에 US 포함 | nameEn·descriptionEn (없으면 한국어) | `relevanceLanguage=en`, `regionCode=US`, 검색어 = youtubeKeywordEn (기본 "영문 상품명 review") |

  YouTube Data API `search.list` 의 `relevanceLanguage`(ISO 639-1)와 `regionCode`(ISO 3166-1 alpha-2) 파라미터를 쓴다.
- 영상 캐시(`product_video`)는 **상품 × 언어** 단위로 따로 저장·큐레이션한다 (한국어 유튜버 고정/제외와 영어 유튜버 고정/제외가 섞이지 않게).
- 유튜버 인기순은 **채널 전체 조회수**(`channels.list` 의 `statistics.viewCount`) 기준. 영상 저장 시 채널 통계도 함께 저장한다.
- 프론트 기본 동작: 백엔드가 아직 새 필드·API 를 주지 않아도 화면이 깨지지 않는다 (모아보기 목록은 빈 배열 → 섹션 숨김, 상세는 404).

## 3. 결과물 — 규격

### 공통
- 모든 방문자용 GET 에 `lang=ko|en` (없으면 `ko`).
  `/api/site`, `/api/categories`, `/api/products`, `/api/products/{id}`, `/api/products/{id}/related`, `/api/products/{id}/videos`, `/api/videos`, `/api/videos/{videoId}`, `/api/community/posts`
- `Product` 응답의 `name`·`description` 은 요청 언어로 채워서 보낸다.

### 상품 목록 `GET /api/products?lang=&category=&q=&sort=&page=&size=`
> **구현됨 (2026-11-13, `backend/.../catalog`)** — 정렬·검색·페이지 나눔을 SQL 한 번으로 처리. 응답은 배열 그대로, 전체 개수는 `X-Total-Count` 헤더. `page` 1부터, `size` 기본 40·최대 100.
> 유튜버 인기(`channelViews`) = 그 채널이 우리 카탈로그에 올린 영상들의 조회수 합계 (채널 ID·구독자 수를 저장하게 되면 교체).
- `q`: **상품명 + 연결된 영상의 유튜버(채널) 이름**으로 검색
- `sort`: `new`(기본) · `videoViews`(대표 리뷰 영상 조회수순) · `channelViews`(유튜버 인기순) · `priceAsc` · `priceDesc` · `name`
- 응답 `Product` 에 추가 (선택): `primaryVideoId` — 이 상품을 소개한 대표 영상 ID. 홈 "새로 들어온 상품"에서 **영상당 1개만** 보이게 하는 데 쓴다.

### 상품 영상 `GET /api/products/{id}/videos?lang=`
`Video` 에 추가 (선택):
```json
{ "channelId": "UC…", "channelViewCount": 1234567890, "channelSubscriberCount": 2500000, "productCount": 5 }
```
`productCount` 가 2 이상이면 패널에 "이 영상 속 상품 N개 모아보기" 링크가 뜬다.

### 영상 모아보기 목록 `GET /api/videos?lang=&minProducts=2&limit=24&sort=&q=`
> **구현됨 (2026-11-13)** — 목록·상세 모두. `new` 정렬 = 가장 최근에 상품이 붙은 영상 순.
- `minProducts`: 연결 상품이 이 개수 이상인 영상만 (기본 2, 검색 시 프론트는 1)
- `sort`: `views`(기본, 영상 조회수순) · `channelViews`(유튜버 인기순) · `new`
- `q`: 영상 제목 + 유튜버 이름
```json
[
  {
    "video": { "videoId": "CCH4BMyUDdo", "title": "…", "channelTitle": "ITSub잇섭", "thumbnailUrl": "…", "viewCount": 1377182, "channelViewCount": 3200000000 },
    "productCount": 5,
    "products": [ /* Product 최대 4개 (미리보기) */ ]
  }
]
```

### 영상 모아보기 상세 `GET /api/videos/{videoId}?lang=`
위와 같은 모양, `products` 는 그 언어 시장에 노출되는 **전부**. 없는 영상이면 `404`.

### 한번에 담기
서버 API 추가 없음. 프론트가 옵션 없는 상품만 골라 장바구니(브라우저)에 담고, 옵션 상품은 "옵션 선택 필요"로 표시해 상품 페이지로 안내한다. 가격·재고는 기존처럼 주문 생성 시 서버가 다시 확인한다.

### 관리자
- `POST/PUT /api/admin/products` 요청 `ProductForm` 에 추가:
  ```json
  { "markets": ["KR", "US"], "nameEn": "Galaxy Buds4 Pro", "descriptionEn": "…", "youtubeKeywordEn": "galaxy buds 4 pro review" }
  ```
  - `markets` 1개 이상 필수, `US` 포함 시 `nameEn` 필수
  - **1이미지 1상품**: 같은 `imageUrl` (쿼리스트링 제외, 대소문자 무시)을 다른 상품이 쓰면 `409 Conflict`. 프론트도 저장 전에 막는다.
- `GET /api/admin/products` 응답 `AdminProduct` 에 `markets`, `nameEn`, `descriptionEn`, `youtubeKeywordEn` 포함
- 영상 관리 3종에 `lang` 추가: `GET …/videos?lang=`, `POST …/videos/refresh?lang=`, `PUT …/videos/curation?lang=`

### 커뮤니티
- 목록 `GET /api/community/posts?lang=` → 그 언어로 쓰인 글만
- 작성 `POST /api/community/posts` 본문에 `"lang": "ko" | "en"` 포함

### DB 변경 제안 (참고)
- `product`: `markets`(SET 또는 별도 `product_market` 테이블), `name_en`, `description_en`, `image_url` UNIQUE
- `product_youtube_setting`: `keyword_en`
- `product_video`: PK 에 `lang` 추가
- `youtube_video`: `channel_id`, `channel_view_count`, `channel_subscriber_count`
- `product`: `primary_video_id` (선택)
- `community_post`: `lang`

## 4. 향후 계획
- 영어 화면 가격 표기: 지금은 원화(₩)만. 필요하면 백엔드가 `currency`·환산가를 내려주고 프론트 포맷만 바꾼다
- 언어를 바꿀 때 장바구니에 이미 담긴 상품 이름은 담을 때 언어로 남는다 → 주문 화면에서 서버 이름으로 갱신 검토
- 유튜버 페이지(채널별 모아보기) 추가 검토
