"use client";

import { useI18n } from "@/controllers/useI18n";
import styles from "./QuantityStepper.module.css";

export default function QuantityStepper({
  value, onChange, min = 1, max = 99, labelledBy, label,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; labelledBy?: string; label?: string }) {
  const { t } = useI18n();
  return (
    <div className={styles.stepper} role="group" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : (label ?? t.product.quantity)}>
      <button type="button" aria-label={t.product.decrease} disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      {/* 바뀐 수량을 화면낭독기에 알림 */}
      <span className={styles.value} aria-live="polite" aria-atomic="true">{value}</span>
      <button type="button" aria-label={t.product.increase} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
