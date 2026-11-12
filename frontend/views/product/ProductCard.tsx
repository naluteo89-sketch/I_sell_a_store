import Link from "next/link";
import type { Product } from "@/models/types";
import Badge from "@/views/ui/Badge";
import PriceRange from "./PriceRange";
import ProductImage from "./ProductImage";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      <div className={styles.thumb}>
        <ProductImage src={product.imageUrl} name={product.name} dim={soldOut} />
        {soldOut && (
          <span className={styles.badge}>
            <Badge tone="dark">품절</Badge>
          </span>
        )}
      </div>
      <div className={styles.body}>
        {product.categoryName && <p className={styles.category}>{product.categoryName}</p>}
        <p className={styles.name}>{product.name}</p>
        <PriceRange product={product} compact />
        {product.options.length > 0 && (
          <p className={styles.options}>{product.options.map((o) => o.name).join(" · ")} 선택</p>
        )}
      </div>
    </Link>
  );
}
