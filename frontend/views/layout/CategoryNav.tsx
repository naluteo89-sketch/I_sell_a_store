import Link from "next/link";
import type { Category } from "@/models/types";
import styles from "./CategoryNav.module.css";

/** desktop: 헤더 안 가로 메뉴 / mobile: 헤더 아래 가로 스크롤 칩 */
export default function CategoryNav({ categories, variant }: { categories: Category[]; variant: "desktop" | "mobile" }) {
  return (
    <nav className={styles[variant]}>
      <Link href="/products" className={styles.item}>
        전체
      </Link>
      {categories.map((c) => (
        <Link key={c.slug} href={`/products?category=${c.slug}`} className={styles.item}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
