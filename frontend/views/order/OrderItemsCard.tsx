"use client";

import { useI18n } from "@/controllers/useI18n";
import type { Order } from "@/models/types";
import Card from "@/views/ui/Card";
import styles from "./OrderItemsCard.module.css";

export default function OrderItemsCard({ order }: { order: Order }) {
  const { t, price } = useI18n();
  const method = order.payment ? (t.checkout.methods[order.payment.method] ?? order.payment.method) : "";
  const payStatus = order.payment ? (t.order.status[order.payment.status] ?? order.payment.status) : "";
  return (
    <Card>
      <ul className={styles.list}>
        {order.items.map((i, idx) => (
          <li key={idx} className={styles.line}>
            <span>
              {i.productName}
              {i.optionLabel && <span className={styles.option}> ({i.optionLabel})</span>}
              <span className={styles.option}> × {i.quantity}</span>
            </span>
            <span>{price(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.total}>
        <span>{t.order.amount}</span>
        <span>{price(order.totalAmount)}</span>
      </div>
      {order.payment && <p className={styles.payment}>{t.order.paidWith(method, payStatus)}</p>}
    </Card>
  );
}
