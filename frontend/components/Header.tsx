/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Category, Site } from "@/lib/api";
import CartLink from "./CartLink";

export default function Header({ site, categories }: { site: Site; categories: Category[] }) {
  const { brand, features } = site;
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-brand">
          {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-8" /> : brand.name}
        </Link>

        <nav className="hidden gap-4 text-sm text-gray-600 lg:flex">
          <Link href="/products" className="hover:text-brand">
            전체
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="hover:text-brand">
              {c.name}
            </Link>
          ))}
        </nav>

        {/* 검색: 별도 스크립트 없이 /products?q= 로 이동 */}
        <form action="/products" className="ml-auto flex min-w-0 flex-1 justify-end md:max-w-xs">
          <input
            type="search"
            name="q"
            placeholder="상품 검색"
            className="w-full rounded-full border bg-gray-50 px-4 py-1.5 text-sm outline-none focus:border-brand"
          />
        </form>

        <Link href="/orders" className="hidden shrink-0 text-sm text-gray-600 hover:text-brand sm:block">
          주문조회
        </Link>
        {features.cart && <CartLink />}
      </div>

      {/* 모바일: 카테고리 가로 스크롤 */}
      <nav className="flex gap-2 overflow-x-auto px-4 pb-2 text-sm lg:hidden">
        <Link href="/products" className="shrink-0 rounded-full bg-gray-100 px-3 py-1">
          전체
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/products?category=${c.slug}`} className="shrink-0 rounded-full bg-gray-100 px-3 py-1">
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
