"use client";

import { useRef } from "react";
import { useI18n } from "@/controllers/useI18n";
import { useProductPurchase } from "@/controllers/useProductPurchase";
import type { Product } from "@/models/types";
import Button from "@/views/ui/Button";
import QuantityStepper from "@/views/ui/QuantityStepper";
import OptionSelector from "./OptionSelector";
import styles from "./PurchasePanel.module.css";

/**
 * V — 옵션 선택 + 수량 + 장바구니/바로구매 (로직은 useProductPurchase)
 * 옵션을 안 골라도 버튼은 눌린다 → 누르면 빠진 옵션으로 포커스 이동 + 안내 문구 (Vercel: Don't pre-disable submit)
 * 품절일 때만 버튼을 잠근다.
 */
export default function PurchasePanel({ product }: { product: Product }) {
  const c = useProductPurchase(product);
  const { t, price } = useI18n();
  const panel = useRef<HTMLDivElement>(null);

  const run = (action: () => boolean) => {
    if (!action()) {
      // 첫 번째 미선택 옵션 묶음의 고를 수 있는 버튼으로 이동
      panel.current?.querySelector<HTMLButtonElement>('[data-missing="true"] button:not(:disabled)')?.focus();
    }
  };

  return (
    <div className={styles.panel} ref={panel}>
      {c.withOptions && (
        <OptionSelector options={product.options} selected={c.selected} isAvailable={c.isAvailable} onPick={c.pick}
          highlightMissing={c.needOptions} />
      )}

      <div className={styles.summary}>
        <div className={styles.qty}>
          <span className={styles.qtyLabel} id="qty-label">{t.product.quantity}</span>
          <QuantityStepper value={c.quantity} onChange={c.setQuantity} max={Math.max(1, Math.min(99, c.stock))} labelledBy="qty-label" />
        </div>
        <div className={styles.total} aria-live="polite">
          {!c.allChosen ? (
            <p className={styles.hint}>{t.product.pickOptions}</p>
          ) : (
            <>
              <p className={styles.hint}>
                {c.variant ? `${c.variant.label} · ` : ""}
                {c.stock > 0 ? t.product.stockLeft(c.stock) : t.product.soldOut}
              </p>
              <p className={styles.amount}>{price(c.unitPrice * c.quantity)}</p>
            </>
          )}
        </div>
      </div>

      <div className={styles.status} role="status">
        {c.needOptions && <p className={styles.warn}>{t.product.needOptions}</p>}
        {c.added && <p className={styles.ok}>{t.product.addedStatus}</p>}
      </div>

      <div className={styles.actions}>
        <Button variant="outline" size="lg" full disabled={c.soldOut} onClick={() => run(c.addToCart)}>
          {c.added ? t.product.added : t.product.addToCart}
        </Button>
        <Button size="lg" full disabled={c.soldOut} onClick={() => run(c.buyNow)}>
          {c.soldOut ? t.product.soldOut : t.product.buyNow}
        </Button>
      </div>
    </div>
  );
}
