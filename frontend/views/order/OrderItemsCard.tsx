import type { Order } from "@/models/types";
import { won } from "@/lib/format";
import Card from "@/views/ui/Card";
import styles from "./OrderItemsCard.module.css";

export default function OrderItemsCard({ order }: { order: Order }) {
  return (
    <Card>
      <ul className={styles.list}>
        {order.items.map((i, idx) => (
          <li key={idx} className={styles.line}>
            <span>
              {i.productName}
              {i.optionLabel && <span className={styles.option}> ({i.optionLabel})</span>} × {i.quantity}
            </span>
            <span>{won(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.total}>
        <span>결제 금액</span>
        <span>{won(order.totalAmount)}</span>
      </div>
      {order.payment && (
        <p className={styles.payment}>
          결제 수단 {order.payment.method} · {order.payment.status === "PAID" ? "결제 완료" : order.payment.status}
        </p>
      )}
    </Card>
  );
}
