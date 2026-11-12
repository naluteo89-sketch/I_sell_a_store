import { won } from "@/lib/format";
import { ButtonLink } from "@/views/ui/Button";
import Card from "@/views/ui/Card";
import styles from "./CartSummary.module.css";

export default function CartSummary({ total }: { total: number }) {
  return (
    <Card>
      <div className={styles.row}>
        <span>배송비</span>
        <span>무료</span>
      </div>
      <div className={styles.total}>
        <span>합계</span>
        <span>{won(total)}</span>
      </div>
      <p className={styles.note}>가격·재고는 주문할 때 다시 확인됩니다.</p>
      <ButtonLink href="/checkout" size="lg" full>
        주문하기
      </ButtonLink>
    </Card>
  );
}
