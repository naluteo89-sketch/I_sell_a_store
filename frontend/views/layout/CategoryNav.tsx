"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/controllers/useI18n";
import type { Category } from "@/models/types";
import styles from "./CategoryNav.module.css";

type Props = { categories: Category[]; variant: "desktop" | "mobile" };

/** desktop: 헤더 캡슐 안 가로 메뉴 / mobile: 캡슐 아래 가로 스크롤 칩 */
function Nav({ categories, variant }: Props) {
  const { t, category } = useI18n();
  const pathname = usePathname();
  const current = useSearchParams().get("category");
  const onList = pathname === "/products";
  const cls = (active: boolean) => `${styles.item} ${active ? styles.active : ""}`;
  const cur = (active: boolean) => (active ? ("page" as const) : undefined);

  return (
    <nav className={styles[variant]} aria-label={t.nav.categories}>
      <Link href="/products" className={cls(onList && !current)} aria-current={cur(onList && !current)}>
        {t.nav.all}
      </Link>
      {categories.map((c) => (
        <Link key={c.slug} href={`/products?category=${c.slug}`} className={cls(onList && current === c.slug)}
          aria-current={cur(onList && current === c.slug)}>
          {category(c.slug, c.name)}
        </Link>
      ))}
      {variant === "mobile" && (
        <Link href="/videos" className={cls(pathname.startsWith("/videos"))} aria-current={cur(pathname.startsWith("/videos"))}>
          {t.nav.videos}
        </Link>
      )}
      {variant === "mobile" && (
        <Link href="/community" className={cls(pathname.startsWith("/community"))} aria-current={cur(pathname.startsWith("/community"))}>
          {t.nav.community}
        </Link>
      )}
    </nav>
  );
}

export default function CategoryNav(props: Props) {
  // useSearchParams 는 Suspense 경계가 필요하다 (정적 렌더 시 경고 방지)
  return (
    <Suspense fallback={<nav className={styles[props.variant]} />}>
      <Nav {...props} />
    </Suspense>
  );
}
