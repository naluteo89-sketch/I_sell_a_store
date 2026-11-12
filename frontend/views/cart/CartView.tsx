"use client";

import { cartTotal, useCart } from "@/controllers/useCart";
import { useMounted } from "@/controllers/useMounted";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import styles from "./CartView.module.css";

export default function CartView() {
  const { lines, setQuantity, remove } = useCart();
  const mounted = useMounted();
  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <EmptyState action={<ButtonLink href="/products">쇼핑하러 가기</ButtonLink>}>장바구니가 비어 있습니다.</EmptyState>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>장바구니</h1>
      <div className={styles.layout}>
        <ul className={styles.list}>
          {lines.map((l) => (
            <CartLineItem key={l.key} line={l} onQuantity={(q) => setQuantity(l.key, q)} onRemove={() => remove(l.key)} />
          ))}
        </ul>
        <CartSummary total={cartTotal(lines)} />
      </div>
    </div>
  );
}
