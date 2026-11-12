"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import type { Product } from "@/models/types";
import Badge from "@/views/ui/Badge";
import PriceRange from "./PriceRange";
import ProductImage from "./ProductImage";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }: { product: Product }) {
  const { t, category } = useI18n();
  const soldOut = product.stock <= 0;
  const categoryName = category(product.categorySlug, product.categoryName);
  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      <div className={styles.thumb}>
        <ProductImage src={product.imageUrl} name={product.name} dim={soldOut} />
        {soldOut && (
          <span className={styles.badge}>
            <Badge tone="dark">{t.product.soldOut}</Badge>
          </span>
        )}
      </div>
      <div className={styles.body}>
        {categoryName && <p className={styles.category}>{categoryName}</p>}
        <p className={styles.name}>{product.name}</p>
        <PriceRange product={product} compact />
        {product.options.length > 0 && (
          <p className={styles.options}>{t.product.chooseOptions(product.options.map((o) => o.name).join(", "))}</p>
        )}
      </div>
    </Link>
  );
}
