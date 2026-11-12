export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

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

/** 백엔드가 꺼져 있어도 화면이 깨지지 않도록 쓰는 기본값 */
export const FALLBACK_SITE: Site = {
  brand: {
    name: "I sell a store",
    tagline: "",
    logoUrl: "",
    primaryColor: "#111827",
    accentColor: "#ef4444",
    phone: "",
    email: "",
    businessInfo: "",
  },
  features: { cart: true, payment: true, reviews: false, youtubePanel: true },
};

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

export type Video = {
  videoId: string;
  title: string | null;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
};

// ───────── 주문 ─────────

export type OrderStatus = "PENDING" | "PAID" | "CANCELED";

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

export type OrderForm = {
  shipping: {
    recipientName: string;
    phone: string;
    zipcode: string;
    address1: string;
    address2: string;
    memo: string;
  };
  items: { productId: number; variantId: number | null; quantity: number }[];
};

// ───────── 공통 요청 ─────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export async function send<T>(path: string, method: "POST" | "PUT", body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? `요청 실패 (${res.status})`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ───────── 조회 ─────────

export async function fetchSite(): Promise<Site> {
  try {
    return await get<Site>("/api/site");
  } catch {
    return FALLBACK_SITE;
  }
}

export const fetchCategories = () => get<Category[]>("/api/categories").catch(() => [] as Category[]);

export type ProductSort = "new" | "priceAsc" | "priceDesc" | "name";

export function fetchProducts(params: { category?: string; q?: string; sort?: ProductSort } = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  if (params.sort && params.sort !== "new") qs.set("sort", params.sort);
  const query = qs.toString();
  return get<Product[]>(`/api/products${query ? `?${query}` : ""}`).catch(() => [] as Product[]);
}

export const fetchProduct = (id: string) => get<Product>(`/api/products/${id}`);

export const fetchRelated = (id: number) =>
  get<Product[]>(`/api/products/${id}/related`).catch(() => [] as Product[]);

export const fetchVideos = (productId: number) => get<Video[]>(`/api/products/${productId}/videos`);

/** 주문 조회는 주문 때 입력한 연락처가 맞아야 된다 (개인정보 보호) */
export const fetchOrder = (orderNo: string, phone: string) =>
  get<Order>(`/api/orders/${encodeURIComponent(orderNo)}?phone=${encodeURIComponent(phone)}`);

export const orderApi = {
  create: (form: OrderForm) => send<Order>("/api/orders", "POST", form),
  pay: (orderNo: string, method: string) => send<Order>(`/api/orders/${encodeURIComponent(orderNo)}/pay`, "POST", { method }),
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

export const adminApi = {
  products: () => get<AdminProduct[]>("/api/admin/products"),
  create: (form: ProductForm) => send<AdminProduct>("/api/admin/products", "POST", form),
  update: (id: number, form: ProductForm) => send<AdminProduct>(`/api/admin/products/${id}`, "PUT", form),
  deactivate: (id: number) => fetch(`${API_BASE}/api/admin/products/${id}`, { method: "DELETE" }),
  activate: (id: number) => fetch(`${API_BASE}/api/admin/products/${id}/activate`, { method: "POST" }),
  videos: (id: number) => get<AdminVideoView>(`/api/admin/products/${id}/videos`),
  refreshVideos: (id: number) => send<Video[]>(`/api/admin/products/${id}/videos/refresh`, "POST", {}),
  curate: (id: number, body: { pinnedVideoIds?: string[]; excludedVideoIds?: string[]; hidden?: boolean }) =>
    send<Video[]>(`/api/admin/products/${id}/videos/curation`, "PUT", body),
};
