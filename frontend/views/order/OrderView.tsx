"use client";

import { useI18n } from "@/controllers/useI18n";
import { useOrderView } from "@/controllers/useOrderView";
import { ButtonLink } from "@/views/ui/Button";
import OrderItemsCard from "./OrderItemsCard";
import PhoneCheckForm from "./PhoneCheckForm";
import ShippingCard from "./ShippingCard";
import styles from "./OrderView.module.css";

/** V — 주문 완료/조회 (로직은 useOrderView) */
export default function OrderView({ orderNo, justOrdered }: { orderNo: string; justOrdered: boolean }) {
  const { order, state, error, verify } = useOrderView(orderNo);
  const { t } = useI18n();

  if (state === "loading") return <p className={styles.loading}>{t.order.loading}</p>;
  if (state === "ask" || !order) return <PhoneCheckForm orderNo={orderNo} error={error ? t.order.notFound : null} onSubmit={verify} />;

  const done = justOrdered && order.status === "PAID";
  return (
    <div className={styles.page}>
      <div className={styles.head}>
        {done && (
          <span className={styles.check} aria-hidden>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="m8 14.5 4 4 8-9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        <h1 className={styles.title}>{done ? t.order.completed : t.order.statusTitle(t.order.status[order.status])}</h1>
        <p className={styles.orderNo} translate="no">{order.orderNo}</p>
        {justOrdered && <p className={styles.note}>{t.order.saveNumber}</p>}
      </div>
      <OrderItemsCard order={order} />
      {order.shipping && <ShippingCard shipping={order.shipping} />}
      <div className={styles.actions}>
        <ButtonLink href="/products" size="lg">{t.order.continueShopping}</ButtonLink>
      </div>
    </div>
  );
}
