"use client";

import { useI18n } from "@/controllers/useI18n";
import { priceRange } from "@/lib/variants";
import type { Product } from "@/models/types";
import styles from "./PriceRange.module.css";

/** 옵션별 가격이 다르면 "최저가 ~ 최고가" (compact 면 "최저가 ~") */
export default function PriceRange({ product, size = "md", compact }: { product: Product; size?: "md" | "lg"; compact?: boolean }) {
  const { price } = useI18n();
  const { min, max } = priceRange(product);
  return (
    <p className={`${styles.price} ${styles[size]}`}>
      {price(min)}
      {max > min && <span className={styles.rest}>{compact ? " ~" : ` ~ ${price(max)}`}</span>}
    </p>
  );
}
