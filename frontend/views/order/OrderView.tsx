"use client";

import { useOrderView } from "@/controllers/useOrderView";
import type { Order } from "@/models/types";
import { ButtonLink } from "@/views/ui/Button";
import OrderItemsCard from "./OrderItemsCard";
import PhoneCheckForm from "./PhoneCheckForm";
import ShippingCard from "./ShippingCard";
import styles from "./OrderView.module.css";

const STATUS: Record<Order["status"], string> = { PENDING: "결제 대기", PAID: "결제 완료", CANCELED: "취소됨" };

/** V — 주문 완료/조회 (로직은 useOrderView) */
export default function OrderView({ orderNo, justOrdered }: { orderNo: string; justOrdered: boolean }) {
  const { order, state, error, verify } = useOrderView(orderNo);

  if (state === "loading") return <p className={styles.loading}>주문 정보를 불러오는 중…</p>;
  if (state === "ask" || !order) return <PhoneCheckForm orderNo={orderNo} error={error} onSubmit={verify} />;

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>
          {justOrdered && order.status === "PAID" ? "주문이 완료되었습니다" : `주문 ${STATUS[order.status]}`}
        </h1>
        <p className={styles.orderNo}>{order.orderNo}</p>
        {justOrdered && <p className={styles.note}>주문번호를 저장해 두세요. 주문 조회에 필요합니다.</p>}
      </div>
      <OrderItemsCard order={order} />
      {order.shipping && <ShippingCard shipping={order.shipping} />}
      <div className={styles.actions}>
        <ButtonLink href="/products">계속 쇼핑하기</ButtonLink>
      </div>
    </div>
  );
}
