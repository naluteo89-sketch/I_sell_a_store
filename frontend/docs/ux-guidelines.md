# 보이지 않는 UI/UX 적용 기록

## 1. 업무 배경
디자인(보이는 부분)을 개편한 뒤, 사용자가 의식하지 못하지만 체감 품질을 좌우하는 부분을 공신력 있는 가이드에 맞춰 정비했다. 대상은 키보드·화면낭독기 사용, 터치, 폼 입력, 로딩·오류 상태, 성능이다. 커뮤니티의 프론트 예시 글은 삭제하고, 글은 DB(백엔드 API)에서만 오도록 바꿨다.

## 2. 분석 및 방향성
참고한 기준:
- **WCAG 2.2 / KWCAG 2.2**: 웹 접근성 국제·국가 표준. 2.2 에서 추가된 *포커스 가림 방지(2.4.11)*, *터치 영역 최소 24px(2.5.8)* 포함
- **Vercel Web Interface Guidelines**: 상호작용·폼·애니메이션·성능의 세부 규칙
- **Baymard Institute 결제 UX 연구**: 결제 폼 라벨·필수/선택 표시·오류 안내·입력값 보존
- **Apple HIG / Material**: 손가락 터치 영역 44pt(48dp)

원칙: 화면 모양은 바꾸지 않고, "막히는 곳·헷갈리는 곳·기다리는 느낌"을 없앤다.

## 3. 결과물 — 적용 항목

### 키보드·화면낭독기
| 항목 | 근거 | 위치 |
|---|---|---|
| 본문 바로가기 링크 (첫 Tab 에 나타남) | KWCAG 반복 영역 건너뛰기, Vercel | `app/layout.tsx`, `globals.css .skip-link` |
| 고정 헤더가 포커스를 가리지 않게 `scroll-padding-top` | WCAG 2.4.11 | `globals.css` |
| 포커스 링: 흰 틈 + 브랜드색 2px (어떤 배경에서도 보임) | WCAG 2.4.7, Vercel | `tokens.css --ring` |
| 현재 메뉴·탭·정렬에 `aria-current` | WAI-ARIA | CategoryNav, ListToolbar, BoardTabs, Pagination |
| 내비게이션 영역 이름(`aria-label`) | WAI-ARIA landmarks | Header, CategoryNav, ListToolbar |
| 옵션 버튼 `aria-pressed`, 옵션 묶음 `role=group` | WAI-ARIA | OptionSelector |
| 수량 변경·담기·오류를 `aria-live` 로 읽어줌 | Vercel: Announce async updates | QuantityStepper, PurchasePanel, 폼 오류 |
| 상호·주문번호는 자동번역 제외 `translate="no"` | Vercel | Header, Footer, 주문 화면 |

### 색·명도 대비
| 항목 | 값 |
|---|---|
| 보조 글자 `--text-muted` #56616b | 흰색 6.3 : 1, 배경 5.8 : 1 |
| 옅은 글자 `--text-faint` #606c77 | 흰색 5.4 : 1, 배경 5.0 : 1 (기존 2.5 : 1 → 기준 미달 해결) |
| 흰 아이콘 배경 `--accent-strong` | 4.9 : 1 (기존 로즈 2.5 : 1) |
| 성공·위험 색 | 5.5 : 1 / 5.2 : 1 |
모두 WCAG 1.4.3 본문 기준 4.5 : 1 이상.

### 터치
| 항목 | 근거 |
|---|---|
| 손가락 기기(`pointer: coarse`)에서 모든 버튼·탭·수량·페이지 버튼 44px | Apple HIG 44pt, WCAG 2.5.5 |
| 마우스 기기에서도 최소 28px 이상 | WCAG 2.5.8 (24px) |
| `touch-action: manipulation` (더블탭 확대 지연 제거), 회색 탭 하이라이트 제거 | Vercel |
| 입력칸 글자 16px (iOS 입력 시 자동 확대 방지), 확대 자체는 막지 않음 | Vercel, WCAG 1.4.4 |
| 카드 떠오름 효과는 마우스 기기에서만 | 터치에서 눌린 상태로 남는 문제 방지 |
| 되돌리기 알림은 아이폰 홈 바 위(`safe-area-inset`) | Vercel: Respect safe areas |

### 폼 (결제·주문조회·커뮤니티)
| 항목 | 근거 |
|---|---|
| 라벨을 칸 위에 항상 표시 (placeholder 를 라벨 대신 쓰지 않음) | Baymard, Vercel: Labels everywhere |
| 필수는 `*`, 선택은 "(선택)" 글자로 명시 + 폼 위에 `*` 뜻 안내 | Baymard, KWCAG 명확한 지시사항 |
| placeholder 는 예시값 + 말줄임표(…) | Vercel |
| `autocomplete="shipping name / tel / postal-code / address-line1"` 등 자동완성 | Vercel, Baymard |
| 주문번호: 자동 대문자, 맞춤법 검사 끔 | Vercel: Spellcheck selectively |
| 오류는 해당 칸 바로 아래 + `aria-invalid` + `aria-describedby` | Vercel, Baymard |
| 입력을 건드린 뒤에만 빨간 테두리(`:user-invalid`) | Baymard: 입력 중 재촉하지 않기 |
| 제출 버튼을 미리 막지 않음 → 누르면 빠진 칸으로 이동 | Vercel: Don't pre-disable submit |
| 상품 옵션을 안 고르고 담기 → 빠진 옵션 강조 + 포커스 이동 + 안내 문구 | 위와 동일 |
| 처리 중 버튼: 원래 문구 유지 + 0.2초 뒤 스피너, 중복 클릭 방지 | Vercel: Loading buttons |
| 앞뒤 공백 자동 제거 후 전송 | Vercel: Trim input values |
| 작성 중 새로고침·탭 닫기 경고 (결제·글쓰기) | Vercel: Warn before navigation |
| 댓글·본문에서 Ctrl(⌘)+Enter 로 등록 | Vercel |
| 입력칸 하나뿐인 화면은 데스크톱에서만 자동 포커스 | Vercel: Autofocus on desktop, rarely on mobile |
| 동의 체크박스와 문구 전체가 하나의 넉넉한 누름 영역 | Vercel: No dead zones |
| 오류 문구는 "무엇이 틀렸는지 + 어떻게 고치는지" | Vercel, Baymard |

### 상태·흐름
| 항목 | 근거 |
|---|---|
| 장바구니 삭제는 확인창 대신 8초간 "되돌리기" | Vercel: Confirm destructive or offer Undo |
| 404 / 오류 화면: 항상 다음 행동(상품 보기·다시 시도·홈) 제시 | Vercel: No dead ends |
| 페이지 이동 로딩: 0.3초 지연 후 실제 격자와 같은 모양으로 표시 | Vercel: show-delay, stable skeletons |
| 좋아요는 누르는 즉시 반영, 실패 시 되돌림 | Vercel: Optimistic updates |
| 목록 필터·정렬·게시판·페이지는 모두 주소(URL)에 저장 | Vercel: URL as state |
| 페이지마다 탭 제목 "페이지 | 상호" | Vercel: Accurate page titles |
| 주문·장바구니 등 개인 화면은 검색엔진 색인 제외 | 개인정보 |

### 성능·움직임
| 항목 | 근거 |
|---|---|
| 상세 대표 이미지만 즉시·우선 로드, 나머지는 스크롤 시 로드 | Vercel: Preload wisely |
| 이미지 가로·세로 크기 명시 → 레이아웃 흔들림(CLS) 방지 | web.dev Core Web Vitals |
| 서체는 next/font 로 자체 호스팅 (외부 요청·글꼴 깜빡임 없음) | Vercel |
| 5초 넘게 반복되던 히어로 떠다니기 → 한 번만 | WCAG 2.2.2 |
| `prefers-reduced-motion` 이면 모든 움직임 정지 | WCAG 2.3.3, Vercel |
| `transition: all` 미사용, transform·opacity 위주 | Vercel |
| 주소창 색(theme-color)을 배경과 맞춤 | Vercel |

## 4. 향후 계획
- 실제 화면에서 키보드만으로 결제까지 진행 테스트, 화면낭독기(NVDA·VoiceOver·센스리더) 점검
- axe DevTools / Lighthouse 접근성·성능 점수 측정 후 남은 항목 수정
- 페이지 이동 시 스크롤 위치 복원 확인, 내부 링크 이동 시 작성 중 경고(현재는 새로고침·탭 닫기만)
- 결제 단계가 늘어나면 단계 표시(진행 막대)를 실제 단계와 1:1로 추가 (Baymard)
