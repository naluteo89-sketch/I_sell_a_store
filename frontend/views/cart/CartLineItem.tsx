import Link from "next/link";
import type { CartLine } from "@/models/types";
import { won } from "@/lib/format";
import ProductImage from "@/views/product/ProductImage";
import QuantityStepper from "@/views/ui/QuantityStepper";
import styles from "./CartLineItem.module.css";

export default function CartLineItem({
  line, onQuantity, onRemove,
}: { line: CartLine; onQuantity: (q: number) => void; onRemove: () => void }) {
  return (
    <li className={styles.item}>
      <div className={styles.thumb}>
        <ProductImage src={line.imageUrl} name={line.name} />
      </div>
      <div className={styles.info}>
        <Link href={`/products/${line.productId}`} className={styles.name}>
          {line.name}
        </Link>
        {line.optionLabel && <p className={styles.sub}>옵션: {line.optionLabel}</p>}
        <p className={styles.sub}>{won(line.price)}</p>
      </div>
      <QuantityStepper value={line.quantity} onChange={onQuantity} />
      <p className={styles.subtotal}>{won(line.price * line.quantity)}</p>
      <button type="button" onClick={onRemove} className={styles.remove}>
        삭제
      </button>
    </li>
  );
}
