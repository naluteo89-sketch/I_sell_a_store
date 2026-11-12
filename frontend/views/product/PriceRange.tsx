import type { Product } from "@/models/types";
import { won } from "@/lib/format";
import { priceRange } from "@/lib/variants";
import styles from "./PriceRange.module.css";

/** 옵션별 가격이 다르면 "최저가 ~ 최고가" (compact 면 "최저가 ~") */
export default function PriceRange({ product, size = "md", compact }: { product: Product; size?: "md" | "lg"; compact?: boolean }) {
  const { min, max } = priceRange(product);
  return (
    <p className={`${styles.price} ${styles[size]}`}>
      {won(min)}
      {max > min && <span className={styles.rest}>{compact ? " ~" : ` ~ ${won(max)}`}</span>}
    </p>
  );
}
