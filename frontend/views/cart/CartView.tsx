"use client";

import { useEffect, useState } from "react";
import { cartTotal, useCart } from "@/controllers/useCart";
import { useI18n } from "@/controllers/useI18n";
import { useMounted } from "@/controllers/useMounted";
import type { CartLine } from "@/models/types";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import styles from "./CartView.module.css";

const UNDO_MS = 8000;

/** 장바구니. 삭제는 확인창 대신 "되돌리기"로 실수를 되돌릴 수 있게 한다 (Vercel: Confirm destructive actions or offer Undo) */
export default function CartView() {
  const { lines, setQuantity, remove, restore } = useCart();
  const mounted = useMounted();
  const { t } = useI18n();
  const [removed, setRemoved] = useState<{ line: CartLine; index: number } | null>(null);

  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(() => setRemoved(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [removed]);

  if (!mounted) return null;

  const onRemove = (line: CartLine, index: number) => {
    remove(line.key);
    setRemoved({ line, index });
  };
  const undo = () => {
    if (removed) restore(removed.line, removed.index);
    setRemoved(null);
  };

  const undoBar = (
    <div className={styles.toastArea} role="status" aria-live="polite">
      {removed && (
        <div className={styles.toast}>
          <span>{t.common.removed(removed.line.name)}</span>
          <button type="button" className={styles.undo} onClick={undo}>
            {t.common.undo}
          </button>
        </div>
      )}
    </div>
  );

  if (lines.length === 0) {
    return (
      <>
        <EmptyState action={<ButtonLink href="/products">{t.cart.goShopping}</ButtonLink>}>{t.cart.empty}</EmptyState>
        {undoBar}
      </>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.cart.title}</h1>
      <div className={styles.layout}>
        <ul className={styles.list}>
          {lines.map((l, i) => (
            <CartLineItem key={l.key} line={l} onQuantity={(q) => setQuantity(l.key, q)} onRemove={() => onRemove(l, i)} />
          ))}
        </ul>
        <CartSummary total={cartTotal(lines)} />
      </div>
      {undoBar}
    </div>
  );
}
