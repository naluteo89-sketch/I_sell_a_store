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
  imageUrl: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  attributes: ProductAttribute[];
  options: ProductOption[];
  variants: ProductVariant[];
};

export type ProductSort = "new" | "priceAsc" | "priceDesc" | "name";

export type Video = {
  videoId: string;
  title: string | null;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
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

export type AdminProduct = {
  product: Product;
  active: boolean;
  demo: boolean;
  youtubeKeyword: string | null;
  effectiveKeyword: string;
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
  attributes: ProductAttribute[];
  options: { name: string; values: string[] }[];
  variants: ProductFormVariant[];
};
