export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

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

export type Category = { id: number; slug: string; name: string; sortOrder: number };

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  metadata: Record<string, unknown>;
};

export type Video = {
  videoId: string;
  title: string | null;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
};

export type OrderItem = { productId: number; productName: string; unitPrice: number; quantity: number };

export type Order = {
  orderNo: string;
  buyerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "CANCELED";
  paymentMethod: string | null;
  paymentTransactionId: string | null;
  items: OrderItem[];
};

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
  return res.json() as Promise<T>;
}

export async function fetchSite(): Promise<Site> {
  try {
    return await get<Site>("/api/site");
  } catch {
    return FALLBACK_SITE;
  }
}

export const fetchCategories = () => get<Category[]>("/api/categories").catch(() => [] as Category[]);

export const fetchProducts = (category?: string) =>
  get<Product[]>(`/api/products${category ? `?category=${encodeURIComponent(category)}` : ""}`).catch(
    () => [] as Product[],
  );

export const fetchProduct = (id: string) => get<Product>(`/api/products/${id}`);

export const fetchVideos = (productId: number) => get<Video[]>(`/api/products/${productId}/videos`);

export const fetchOrder = (orderNo: string) => get<Order>(`/api/orders/${orderNo}`);
