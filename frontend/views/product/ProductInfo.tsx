import type { Product } from "@/models/types";
import AttributeTable from "./AttributeTable";
import PriceRange from "./PriceRange";
import ProductImage from "./ProductImage";
import PurchasePanel from "./PurchasePanel";
import styles from "./ProductInfo.module.css";

/** 상세 왼쪽: 이미지 + 이름·가격·설명·사양·구매 */
export default function ProductInfo({ product, canBuy }: { product: Product; canBuy: boolean }) {
  return (
    <div className={styles.info}>
      <div className={styles.image}>
        <ProductImage src={product.imageUrl} name={product.name} />
      </div>
      <div className={styles.text}>
        <div>
          {product.categoryName && <p className={styles.category}>{product.categoryName}</p>}
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.price}>
            <PriceRange product={product} size="lg" />
          </div>
          {product.stock <= 0 && <p className={styles.soldOut}>품절</p>}
        </div>
        {product.description && <p className={styles.description}>{product.description}</p>}
        <AttributeTable attributes={product.attributes} />
        {canBuy && <PurchasePanel product={product} />}
      </div>
    </div>
  );
}
