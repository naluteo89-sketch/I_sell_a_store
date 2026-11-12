"use client";

import { useProductPurchase } from "@/controllers/useProductPurchase";
import type { Product } from "@/models/types";
import { won } from "@/lib/format";
import Button from "@/views/ui/Button";
import QuantityStepper from "@/views/ui/QuantityStepper";
import OptionSelector from "./OptionSelector";
import styles from "./PurchasePanel.module.css";

/** V — 옵션 선택 + 수량 + 장바구니/바로구매 (로직은 useProductPurchase) */
export default function PurchasePanel({ product }: { product: Product }) {
  const c = useProductPurchase(product);

  return (
    <div className={styles.panel}>
      {c.withOptions && (
        <OptionSelector options={product.options} selected={c.selected} isAvailable={c.isAvailable} onPick={c.pick} />
      )}

      <div className={styles.summary}>
        <div className={styles.qty}>
          <span className={styles.qtyLabel}>수량</span>
          <QuantityStepper value={c.quantity} onChange={c.setQuantity} max={Math.max(1, Math.min(99, c.stock))} />
        </div>
        <div className={styles.total}>
          {!c.allChosen ? (
            <p className={styles.hint}>옵션을 선택해 주세요</p>
          ) : (
            <>
              <p className={styles.hint}>
                {c.variant ? `${c.variant.label} · ` : ""}
                {c.stock > 0 ? `재고 ${c.stock}개` : "품절"}
              </p>
              <p className={styles.amount}>{won(c.unitPrice * c.quantity)}</p>
            </>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" size="lg" full disabled={!c.canBuy} onClick={c.addToCart}>
          {c.added ? "담았습니다" : "장바구니"}
        </Button>
        <Button size="lg" full disabled={!c.canBuy} onClick={c.buyNow}>
          {c.soldOut ? "품절" : "바로 구매"}
        </Button>
      </div>
    </div>
  );
}
