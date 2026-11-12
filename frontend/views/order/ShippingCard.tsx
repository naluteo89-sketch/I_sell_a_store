"use client";

import { useI18n } from "@/controllers/useI18n";
import type { Order } from "@/models/types";
import Card from "@/views/ui/Card";
import styles from "./ShippingCard.module.css";

export default function ShippingCard({ shipping }: { shipping: NonNullable<Order["shipping"]> }) {
  const { t } = useI18n();
  return (
    <Card title={t.order.shippingTitle}>
      <div className={styles.body}>
        <p className={styles.strong}>
          {shipping.recipientName} <span className={styles.muted}>{shipping.phone}</span>
        </p>
        <p className={styles.muted}>
          {shipping.zipcode && `(${shipping.zipcode}) `}
          {shipping.address1} {shipping.address2}
        </p>
        {shipping.memo && <p className={styles.muted}>{t.order.memo(shipping.memo)}</p>}
      </div>
    </Card>
  );
}
