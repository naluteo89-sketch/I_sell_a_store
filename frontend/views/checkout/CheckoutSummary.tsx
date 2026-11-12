"use client";

import { useI18n } from "@/controllers/useI18n";
import type { CartLine } from "@/models/types";
import Button from "@/views/ui/Button";
import Card from "@/views/ui/Card";
import { Checkbox } from "@/views/ui/Field";
import styles from "./CheckoutSummary.module.css";

export default function CheckoutSummary({
  lines, total, agree, onAgree, busy, error,
}: {
  lines: CartLine[];
  total: number;
  agree: boolean;
  onAgree: (v: boolean) => void;
  busy: boolean;
  error: string | null;
}) {
  const { t, price } = useI18n();
  return (
    <Card title={t.checkout.summaryTitle} sticky>
      <ul className={styles.list}>
        {lines.map((l) => (
          <li key={l.key} className={styles.line}>
            <span>
              {l.name}
              {l.optionLabel && <span className={styles.option}> ({l.optionLabel})</span>}
              <span className={styles.qty}> × {l.quantity}</span>
            </span>
            <span>{price(l.price * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.total}>
        <span>{t.checkout.amount}</span>
        <span>{price(total)}</span>
      </div>
      {/* required: 체크 안 하고 누르면 브라우저가 이 칸으로 포커스를 옮기며 안내한다 */}
      <Checkbox required name="agree" checked={agree} onChange={(e) => onAgree(e.target.checked)} label={t.checkout.agree}
        onInvalid={(e) => e.currentTarget.setCustomValidity(t.checkout.agreeNeeded)}
        onInput={(e) => e.currentTarget.setCustomValidity("")} />
      <div aria-live="polite">{error && <p className={styles.error}>{error}</p>}</div>
      {/* 미리 비활성화하지 않는다: 누르면 빠진 항목으로 안내 (처리 중일 때만 잠금) */}
      <Button type="submit" size="lg" full loading={busy}>
        {busy ? t.checkout.processing : t.checkout.pay(price(total))}
      </Button>
    </Card>
  );
}
