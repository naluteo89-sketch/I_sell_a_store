/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Category, Site } from "@/lib/api";
import CartLink from "./CartLink";

export default function Header({ site, categories }: { site: Site; categories: Category[] }) {
  const { brand, features } = site;
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand">
          {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-8" /> : brand.name}
        </Link>
        <nav className="hidden gap-4 text-sm text-gray-600 md:flex">
          <Link href="/products" className="hover:text-brand">
            전체
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="hover:text-brand">
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">{features.cart && <CartLink />}</div>
      </div>
    </header>
  );
}
