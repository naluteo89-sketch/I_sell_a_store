/**
 * M (Model) — 화면이 다루는 데이터의 모양.
 * 백엔드 DTO(ProductDto, OrderDto 등)와 1:1로 맞춘다.
 */

// ───────── 사이트 설정 ─────────

export type Brand = {
  name: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  phone: string;
  email: string;
  businessInfo: string;
};

export type Features = {
  cart: boolean;
  payment: boolean;
  reviews: boolean;
  youtubePanel: boolean;
};

export type Site = { brand: Brand; features: Features };

// ───────── 상품 ─────────

export type Category = { id: number; slug: string; name: string; sortOrder: number };

export type ProductAttribute = { name: string; value: string };
export type ProductOptionValue = { id: number; name: string };
export type ProductOption = { id: number; name: string; values: ProductOptionValue[] };

/** 옵션 조합 (예: 블랙 / M). price = 기본가 + 추가금 */
export type ProductVariant = {
  id: number;
  sku: string | null;
  label: string;
  optionValueIds: number[];
  additionalPrice: number;
  price: number;
  stock: number;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  /** 옵션 상품이면 조합 재고 합계 */
  stock: number;
  /** 대표 이미지 1장 (1이미지 1상품: 다른 상품과 같은 이미지를 쓰지 않는다) */
  imageUrl: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  attributes: ProductAttribute[];
  options: ProductOption[];
  variants: ProductVariant[];
  /** 이 상품을 소개한 대표 리뷰 영상 (같은 영상 상품 묶기에 사용, 백엔드가 주면 활용) */
  /** 대표 영상 조회수·유튜버 이름 (목록 API) */
  videoViewCount?: number;
  channelTitle?: string;
  primaryVideoId?: string | null;
};

/**
 * videoViews: 대표 리뷰 영상 조회수순
 * channelViews: 유튜버(채널) 인기순 — 채널 전체 조회수 기준
 */
export type ProductSort = "new" | "priceAsc" | "priceDesc" | "name" | "videoViews" | "channelViews";

export type Video = {
  videoId: string;
  title: string | null;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
  /** 유튜버(채널) 정보: 유튜버 인기순 정렬·유튜버 이름 검색에 사용 */
  channelId?: string | null;
  channelViewCount?: number;
  channelSubscriberCount?: number;
  /** 이 영상에 연결된 상품 수 (2개 이상이면 "모아보기" 링크 표시) */
  productCount?: number;
};

/** 영상 모아보기 정렬: 영상 조회수순 / 유튜버 인기순 / 최신순 */
export type VideoSort = "views" | "channelViews" | "new";

/** 리뷰 영상 하나 + 그 영상에 나온 상품들 (docs/video-collection-api.md) */
export type VideoCollection = {
  video: Video;
  productCount: number;
  /** 목록 API 에서는 미리보기용 최대 4개, 상세 API 에서는 전부 */
  products: Product[];
};

// ───────── 장바구니 ─────────

/** 장바구니 한 줄 = 상품 + 조합(옵션). 옵션 없는 상품은 variantId 가 null */
export type CartLine = {
  key: string;
  productId: number;
  variantId: number | null;
  name: string;
  optionLabel: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

// ───────── 주문 ─────────

export type OrderStatus = "PENDING" | "PAID" | "CANCELED";

export type ShippingInput = {
  recipientName: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
  memo: string;
};

export type OrderForm = {
  shipping: ShippingInput;
  items: { productId: number; variantId: number | null; quantity: number }[];
};

export type Order = {
  orderNo: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  shipping: {
    recipientName: string;
    phone: string;
    zipcode: string | null;
    address1: string;
    address2: string | null;
    memo: string | null;
  } | null;
  items: {
    productId: number | null;
    variantId: number | null;
    productName: string;
    optionLabel: string | null;
    unitPrice: number;
    quantity: number;
  }[];
  payment: {
    method: string;
    status: "READY" | "PAID" | "FAILED" | "CANCELED";
    transactionId: string | null;
    paidAt: string | null;
  } | null;
};

// ───────── 관리자 ─────────

/** 판매 지역(시장): KR = 한국어 화면, US = 영어(영미권) 화면에 노출 */
export type Market = "KR" | "US";

export type AdminProduct = {
  /** 한국어 기준 상품 정보 */
  product: Product;
  active: boolean;
  demo: boolean;
  youtubeKeyword: string | null;
  effectiveKeyword: string;
  markets?: Market[];
  nameEn?: string | null;
  descriptionEn?: string | null;
  /** 영어권 유튜버 영상 검색어 (비우면 "영문 상품명 review") */
  youtubeKeywordEn?: string | null;
};

export type AdminVideoView = {
  keyword: string;
  fetchedAt: string | null;
  pinnedVideoIds: string[];
  excludedVideoIds: string[];
  hidden: boolean;
  searchResults: Video[];
  displayed: Video[];
  apiKeyConfigured: boolean;
};

export type ProductFormVariant = {
  /** {"색상": "블랙", "사이즈": "M"} */
  options: Record<string, string>;
  additionalPrice: number;
  stock: number;
  sku: string;
  active: boolean;
};

export type ProductForm = {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categorySlug: string;
  youtubeKeyword: string;
  markets: Market[];
  nameEn: string;
  descriptionEn: string;
  youtubeKeywordEn: string;
  attributes: ProductAttribute[];
  options: { name: string; values: string[] }[];
  variants: ProductFormVariant[];
};

// ───────── 커뮤니티 ─────────
// 백엔드 규격: docs/community-api.md

export type CommunityBoard = "review" | "question" | "free";

export type CommunityPostSummary = {
  id: number;
  board: CommunityBoard;
  title: string;
  /** 본문 앞부분 (목록용, 서버에서 잘라서 내려줌) */
  excerpt: string;
  author: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  viewCount: number;
  /** 관련 상품 (선택) */
  productId: number | null;
  productName: string | null;
  productImageUrl: string | null;
};

export type CommunityComment = { id: number; author: string; body: string; createdAt: string };

export type CommunityPost = CommunityPostSummary & {
  body: string;
  comments: CommunityComment[];
  /** 지금 보는 사람이 좋아요를 눌렀는지 */
  liked: boolean;
};

export type CommunityPage = { items: CommunityPostSummary[]; page: number; totalPages: number; total: number };

export type CommunityPostForm = {
  board: CommunityBoard;
  title: string;
  body: string;
  author: string;
  password: string;
  productId: number | null;
};

export type CommunityCommentForm = { author: string; password: string; body: string };

/* ───────── 로그인 · SSO (규격: docs/auth-api.md) ───────── */

/** 지원하는 소셜 로그인. 실제로 켜진 목록은 백엔드 /api/auth/providers 가 정한다 */
export type AuthProviderId = "google" | "kakao" | "naver" | "apple";

export type AuthUser = {
  id: number;
  email: string;
  /** 가입 때 자동 생성, 내 계정에서 변경 가능 */
  nickname: string;
  avatarUrl?: string | null;
  /** 이 계정에 연결된 로그인 방식: "password" + 소셜 id */
  providers: ("password" | AuthProviderId)[];
  role?: "USER" | "ADMIN";
};

export type LoginForm = { email: string; password: string; remember: boolean };
export type SignupForm = { email: string; password: string; nickname: string; agreePrivacy: boolean };

export type NicknameStatus = "AVAILABLE" | "INVALID" | "TAKEN";
