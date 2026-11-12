import Link from "next/link";
import type { Category } from "@/models/types";
import styles from "./CategoryShortcuts.module.css";

export default function CategoryShortcuts({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <div className={styles.grid}>
      {categories.map((c) => (
        <Link key={c.slug} href={`/products?category=${c.slug}`} className={styles.tile}>
          {c.name}
          <span className={styles.hint}>바로가기 →</span>
        </Link>
      ))}
    </div>
  );
}
