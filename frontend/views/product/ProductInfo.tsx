"use client";

import { useI18n } from "@/controllers/useI18n";
import type { Product } from "@/models/types";
import Badge from "@/views/ui/Badge";
import AttributeTable from "./AttributeTable";
import PriceRange from "./PriceRange";
import ProductImage from "./ProductImage";
import PurchasePanel from "./PurchasePanel";
import styles from "./ProductInfo.module.css";

/** 상세 왼쪽: 이미지 + 이름·가격·설명·사양·구매 */
export default function ProductInfo({ product, canBuy }: { product: Product; canBuy: boolean }) {
  const { t, category } = useI18n();
  const categoryName = category(product.categorySlug, product.categoryName);
  return (
    <div className={styles.info}>
      <div className={styles.image}>
        <ProductImage src={product.imageUrl} name={product.name} priority />
      </div>
      <div className={styles.text}>
        <div>
          {categoryName && <p className={styles.category}>{categoryName}</p>}
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.price}>
            <PriceRange product={product} size="lg" />
            {product.stock <= 0 && <Badge tone="accent">{t.product.soldOut}</Badge>}
          </div>
        </div>
        {product.description && <p className={styles.description}>{product.description}</p>}
        <AttributeTable attributes={product.attributes} />
        {canBuy && <PurchasePanel product={product} />}
      </div>
    </div>
  );
}
