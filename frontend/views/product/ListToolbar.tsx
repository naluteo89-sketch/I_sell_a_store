"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import { listHref, SORT_IDS, type ListQuery } from "@/lib/productList";
import type { Category } from "@/models/types";
import styles from "./ListToolbar.module.css";

/** 카테고리 알약 탭 + 정렬 세그먼트 */
export default function ListToolbar({ categories, query }: { categories: Category[]; query: ListQuery }) {
  const { t, category } = useI18n();
  const sort = query.sort ?? "new";
  return (
    <div className={styles.toolbar}>
      <nav className={styles.tabs} aria-label={t.nav.categories}>
        <Link href={listHref(query, { category: undefined })} className={!query.category ? styles.tabActive : styles.tab}
          aria-current={!query.category ? "page" : undefined}>
          {t.nav.all}
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={listHref(query, { category: c.slug })}
            className={c.slug === query.category ? styles.tabActive : styles.tab}
            aria-current={c.slug === query.category ? "page" : undefined}>
            {category(c.slug, c.name)}
          </Link>
        ))}
      </nav>
      <div className={styles.sorts} role="group" aria-label={t.list.sortLabel}>
        {SORT_IDS.map((id) => (
          <Link key={id} href={listHref(query, { sort: id })} className={id === sort ? styles.sortActive : styles.sort}
            aria-current={id === sort ? "true" : undefined}>
            {t.list.sorts[id]}
          </Link>
        ))}
      </div>
    </div>
  );
}
