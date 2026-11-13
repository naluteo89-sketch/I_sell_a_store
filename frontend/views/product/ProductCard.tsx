"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import { useQuickView } from "@/controllers/useQuickView";
import type { Product } from "@/models/types";
import GimmeButton from "@/views/gimme/GimmeButton";
import Badge from "@/views/ui/Badge";
import PriceRange from "./PriceRange";
import ProductImage from "./ProductImage";
import styles from "./ProductCard.module.css";

/**
 * 상품 카드.
 * - 카드 어디를 눌러도 상품 페이지 (상품명 링크가 카드 전체를 덮음 — 링크 안에 버튼을 넣지 않기 위한 구조)
 * - 가격 옆 🛒(Give it to me)만 따로 눌려 빠른 보기 시트를 연다
 */
export default function ProductCard({ product }: { product: Product }) {
  const { t, category } = useI18n();
  const openQuickView = useQuickView((s) => s.open);
  const soldOut = product.stock <= 0;
  const categoryName = category(product.categorySlug, product.categoryName);
  return (
    <article className={styles.card} data-gimme-host="">
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
        <h3 className={styles.name} data-font="plain">
          <Link href={`/products/${product.id}`} className={styles.link}>
            {product.name}
          </Link>
        </h3>
        <div className={styles.priceRow}>
          <PriceRange product={product} compact />
          {!soldOut && <GimmeButton name={product.name} onClick={() => openQuickView(product)} />}
        </div>
        {product.options.length > 0 && (
          <p className={styles.options}>{t.product.chooseOptions(product.options.map((o) => o.name).join(", "))}</p>
        )}
      </div>
    </article>
  );
}
