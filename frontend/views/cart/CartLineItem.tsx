"use client";

import Link from "next/link";
import { useI18n } from "@/controllers/useI18n";
import type { CartLine } from "@/models/types";
import ProductImage from "@/views/product/ProductImage";
import QuantityStepper from "@/views/ui/QuantityStepper";
import styles from "./CartLineItem.module.css";

export default function CartLineItem({
  line, onQuantity, onRemove,
}: { line: CartLine; onQuantity: (q: number) => void; onRemove: () => void }) {
  const { t, price } = useI18n();
  return (
    <li className={styles.item}>
      <div className={styles.thumb}>
        <ProductImage src={line.imageUrl} name={line.name} />
      </div>
      <div className={styles.info}>
        <Link href={`/products/${line.productId}`} className={styles.name}>
          {line.name}
        </Link>
        {line.optionLabel && <p className={styles.sub}>{t.cart.option(line.optionLabel)}</p>}
        <p className={styles.sub}>{price(line.price)}</p>
      </div>
      <div className={styles.controls}>
        <QuantityStepper value={line.quantity} onChange={onQuantity} label={line.name} />
        <p className={styles.subtotal}>{price(line.price * line.quantity)}</p>
        <button type="button" onClick={onRemove} className={styles.remove} aria-label={`${t.cart.remove}: ${line.name}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </li>
  );
}
