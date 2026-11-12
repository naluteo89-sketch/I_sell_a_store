import type { ShippingInput } from "@/models/types";
import { Input } from "@/views/ui/Field";
import styles from "./ShippingForm.module.css";

export default function ShippingForm({
  value, onChange,
}: { value: ShippingInput; onChange: (field: keyof ShippingInput, v: string) => void }) {
  const bind = (field: keyof ShippingInput) => ({
    value: value[field],
    onChange: (e: { target: { value: string } }) => onChange(field, e.target.value),
  });
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>배송 정보</h2>
      <div className={styles.two}>
        <Input required maxLength={100} placeholder="받는 분" autoComplete="name" {...bind("recipientName")} />
        <Input required type="tel" inputMode="tel" pattern="[0-9\-+ ]{8,20}" placeholder="연락처 (주문 조회에 사용)"
          autoComplete="tel" {...bind("phone")} />
      </div>
      <div className={styles.address}>
        <Input maxLength={10} inputMode="numeric" placeholder="우편번호" autoComplete="postal-code" {...bind("zipcode")} />
        <Input required maxLength={255} placeholder="기본 주소" autoComplete="address-line1" {...bind("address1")} />
      </div>
      <Input maxLength={255} placeholder="상세 주소 (동·호수)" autoComplete="address-line2" {...bind("address2")} />
      <Input maxLength={255} placeholder="배송 요청사항 (선택)" {...bind("memo")} />
    </section>
  );
}
