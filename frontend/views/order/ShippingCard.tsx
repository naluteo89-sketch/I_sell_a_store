import type { Order } from "@/models/types";
import Card from "@/views/ui/Card";
import styles from "./ShippingCard.module.css";

export default function ShippingCard({ shipping }: { shipping: NonNullable<Order["shipping"]> }) {
  return (
    <Card title="배송지">
      <div className={styles.body}>
        <p>
          {shipping.recipientName} · {shipping.phone}
        </p>
        <p className={styles.muted}>
          {shipping.zipcode && `(${shipping.zipcode}) `}
          {shipping.address1} {shipping.address2}
        </p>
        {shipping.memo && <p className={styles.muted}>요청사항: {shipping.memo}</p>}
      </div>
    </Card>
  );
}
