"use client";

import { PAYMENT_METHODS } from "@/controllers/useCheckout";
import { useI18n } from "@/controllers/useI18n";
import Button from "@/views/ui/Button";
import styles from "./PaymentMethodPicker.module.css";

/** 결제 수단 (현재 모의 결제: 실제 결제사 연동 시 백엔드 PaymentGateway 만 교체) */
export default function PaymentMethodPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { t } = useI18n();
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.checkout.paymentTitle}</h2>
      <div className={styles.grid} role="radiogroup" aria-label={t.checkout.paymentTitle}>
        {PAYMENT_METHODS.map((id) => (
          <Button key={id} variant="chip" size="lg" role="radio" aria-checked={value === id} active={value === id} onClick={() => onChange(id)}>
            {t.checkout.methods[id]}
          </Button>
        ))}
      </div>
      <p className={styles.note}>{t.checkout.demoNote}</p>
    </section>
  );
}
