import type { CartLine } from "@/models/types";
import { won } from "@/lib/format";
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
  return (
    <Card title="주문 상품" sticky>
      <ul className={styles.list}>
        {lines.map((l) => (
          <li key={l.key} className={styles.line}>
            <span>
              {l.name}
              {l.optionLabel && <span className={styles.option}> ({l.optionLabel})</span>} × {l.quantity}
            </span>
            <span>{won(l.price * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.total}>
        <span>결제 금액</span>
        <span>{won(total)}</span>
      </div>
      <Checkbox required checked={agree} onChange={(e) => onAgree(e.target.checked)}
        label="주문 내용을 확인했으며, 배송을 위한 개인정보 수집·이용에 동의합니다." />
      {error && <p className={styles.error}>{error}</p>}
      <Button type="submit" size="lg" full disabled={busy}>
        {busy ? "처리 중…" : `${won(total)} 결제하기`}
      </Button>
    </Card>
  );
}
