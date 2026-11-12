import Link from "next/link";
import type { Category, ProductSort } from "@/models/types";
import styles from "./ListToolbar.module.css";

export const SORTS: { id: ProductSort; label: string }[] = [
  { id: "new", label: "최신순" },
  { id: "priceAsc", label: "낮은 가격순" },
  { id: "priceDesc", label: "높은 가격순" },
  { id: "name", label: "이름순" },
];

export type ListQuery = { category?: string; q?: string; sort?: string };

/** 현재 조건을 유지한 채 일부만 바꾼 목록 주소 */
export function listHref(current: ListQuery, patch: ListQuery) {
  const merged = { ...current, ...patch };
  const qs = new URLSearchParams();
  if (merged.category) qs.set("category", merged.category);
  if (merged.q) qs.set("q", merged.q);
  if (merged.sort && merged.sort !== "new") qs.set("sort", merged.sort);
  const s = qs.toString();
  return `/products${s ? `?${s}` : ""}`;
}

/** 카테고리 탭 + 정렬 링크 */
export default function ListToolbar({ categories, query }: { categories: Category[]; query: ListQuery }) {
  const sort = query.sort ?? "new";
  return (
    <div className={styles.toolbar}>
      <div className={styles.tabs}>
        <Link href={listHref(query, { category: undefined })} className={!query.category ? styles.tabActive : styles.tab}>
          전체
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={listHref(query, { category: c.slug })}
            className={c.slug === query.category ? styles.tabActive : styles.tab}>
            {c.name}
          </Link>
        ))}
      </div>
      <div className={styles.sorts}>
        {SORTS.map((s) => (
          <Link key={s.id} href={listHref(query, { sort: s.id })} className={s.id === sort ? styles.sortActive : styles.sort}>
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
