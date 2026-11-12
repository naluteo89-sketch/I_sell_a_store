# 커뮤니티 API 규격 (프론트 ↔ 백엔드)

## 1. 업무 배경
쇼핑몰에 구매 후기·질문·자유 게시판을 붙이기 위해 커뮤니티 화면을 먼저 만들었다. 백엔드는 별도로 구현하므로, 프론트가 기대하는 요청·응답 모양을 이 문서로 고정한다.

## 2. 분석 및 방향성
- 회원 기능이 없으므로 **닉네임 + 비밀번호** 방식(비회원 게시판)으로 쓰고 지운다. 비밀번호는 서버에서 해시(BCrypt 등)로 저장하고, 응답에 절대 포함하지 않는다.
- 글·댓글은 전부 DB 에서 온다. 프론트에는 예시 글을 두지 않는다 (`models/api/communityApi.ts` 가 아래 규격으로 호출).
- 백엔드가 꺼져 있거나 오류면 목록은 "다시 시도" 안내, 홈의 최근 글 영역은 숨긴다.
- 오류는 기존 백엔드와 같은 `ErrorResponse { status, message, timestamp }` 형식.

## 3. 결과물 — 엔드포인트

기본 주소: `NEXT_PUBLIC_API_BASE` (기본 `http://localhost:8080`)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/community/posts?board=&page=1&size=10&lang=ko` | 목록 (최신순). `board` 생략 시 전체, `lang` 언어로 쓰인 글만 |
| GET | `/api/community/posts/{id}` | 상세 + 댓글. 호출 시 조회수 +1 |
| POST | `/api/community/posts` | 글 작성 |
| POST | `/api/community/posts/{id}/delete` | 글 삭제 (본문에 비밀번호) |
| POST | `/api/community/posts/{id}/comments` | 댓글 작성 |
| POST | `/api/community/posts/{id}/like` | 좋아요 토글 |

`board` 값: `review`(구매 후기) · `question`(질문) · `free`(자유)

### 목록 응답 `CommunityPage`
```json
{
  "items": [
    {
      "id": 1, "board": "review", "title": "…", "excerpt": "본문 앞 120자",
      "author": "닉네임", "createdAt": "2026-11-12T06:00:00Z",
      "commentCount": 2, "likeCount": 12, "viewCount": 148,
      "productId": 3, "productName": "…", "productImageUrl": "https://…"
    }
  ],
  "page": 1, "totalPages": 3, "total": 25
}
```
`page` 는 1부터 시작. 관련 상품이 없으면 `productId/productName/productImageUrl` 은 `null`.

### 상세 응답 `CommunityPost`
목록 항목 필드 + 아래 필드.
```json
{
  "body": "본문 전체 (줄바꿈 \\n 유지)",
  "liked": false,
  "comments": [{ "id": 1, "author": "닉네임", "body": "…", "createdAt": "…" }]
}
```
`liked` 는 지금 보는 사람이 좋아요를 눌렀는지. 비회원이므로 쿠키·IP 해시 등으로 판별 (방식은 백엔드 재량).

### 글 작성 요청 `CommunityPostForm` → 응답 `CommunityPost`
```json
{ "board": "free", "title": "1~100자", "body": "1~5000자", "author": "1~20자", "password": "4~40자", "productId": null, "lang": "ko" }
```

### 삭제 요청
```json
{ "password": "…" }
```
비밀번호 불일치 → `403`, 없는 글 → `404`. 성공 시 `204`(본문 없음).

### 댓글 작성 요청 `CommunityCommentForm` → 응답 `CommunityComment`
```json
{ "author": "1~20자", "password": "1~40자", "body": "1~1000자" }
```

### 좋아요 응답
```json
{ "likeCount": 13, "liked": true }
```

### CORS
기존 `WebConfig` 처럼 프론트 주소(`http://localhost:3000`)에서 위 경로의 GET/POST 를 허용해야 한다.

## 4. 향후 계획
- 글·댓글 수정, 댓글 삭제 (비밀번호 확인) 화면 추가
- 관리자 숨김 처리, 신고 기능
- 회원 로그인 도입 시 닉네임·비밀번호 대신 계정으로 전환 (응답 모양은 유지)
- 상품 상세 페이지에 해당 상품 관련 글 노출
