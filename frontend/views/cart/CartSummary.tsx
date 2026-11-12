"use client";

import { useI18n } from "@/controllers/useI18n";
import { ButtonLink } from "@/views/ui/Button";
import Card from "@/views/ui/Card";
import styles from "./CartSummary.module.css";

export default function CartSummary({ total }: { total: number }) {
  const { t, price } = useI18n();
  return (
    <Card sticky>
      <div className={styles.row}>
        <span>{t.cart.shipping}</span>
        <span>{t.cart.free}</span>
      </div>
      <div className={styles.total}>
        <span>{t.cart.total}</span>
        <span>{price(total)}</span>
      </div>
      <ButtonLink href="/checkout" size="lg" full>
        {t.cart.checkout}
      </ButtonLink>
      <p className={styles.note}>{t.cart.note}</p>
    </Card>
  );
}
