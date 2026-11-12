import { PAYMENT_METHODS } from "@/controllers/useCheckout";
import Button from "@/views/ui/Button";
import styles from "./PaymentMethodPicker.module.css";

/** 결제 수단 (현재 모의 결제: 실제 결제사 연동 시 백엔드 PaymentGateway 만 교체) */
export default function PaymentMethodPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>결제 수단</h2>
      <div className={styles.grid}>
        {PAYMENT_METHODS.map((m) => (
          <Button key={m.id} variant="chip" size="lg" active={value === m.id} onClick={() => onChange(m.id)}>
            {m.label}
          </Button>
        ))}
      </div>
      <p className={styles.note}>데모 사이트입니다. 실제 결제는 이루어지지 않습니다.</p>
    </section>
  );
}
