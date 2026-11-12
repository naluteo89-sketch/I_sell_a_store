"use client";

import { useI18n } from "@/controllers/useI18n";
import type { ShippingInput } from "@/models/types";
import { Input } from "@/views/ui/Field";
import FormField, { RequiredNote } from "@/views/ui/FormField";
import styles from "./ShippingForm.module.css";

/**
 * 배송 정보 — Baymard 결제 폼 지침:
 * 라벨은 칸 위에 항상 표시, 필수·선택 명시, 이름은 한 칸, 예시형 placeholder,
 * 브라우저 자동완성(autocomplete="shipping …") 지원
 */
export default function ShippingForm({
  value, onChange,
}: { value: ShippingInput; onChange: (field: keyof ShippingInput, v: string) => void }) {
  const { t } = useI18n();
  const bind = (field: keyof ShippingInput) => ({
    name: field,
    value: value[field],
    onChange: (e: { target: { value: string } }) => onChange(field, e.target.value),
  });
  return (
    <section className={styles.section} aria-labelledby="shipping-title">
      <div className={styles.head}>
        <h2 id="shipping-title" className={styles.title}>{t.checkout.shippingTitle}</h2>
        <RequiredNote />
      </div>
      <div className={styles.two}>
        <FormField label={t.checkout.recipient}>
          {(a) => <Input {...a} maxLength={100} placeholder={t.checkout.recipientPh} autoComplete="shipping name" {...bind("recipientName")} />}
        </FormField>
        <FormField label={t.checkout.phone} hint={t.checkout.phoneHint}>
          {(a) => (
            <Input {...a} type="tel" inputMode="tel" pattern="[0-9\-+ ]{8,20}" placeholder={t.checkout.phonePh}
              autoComplete="shipping tel" {...bind("phone")} />
          )}
        </FormField>
      </div>
      <div className={styles.address}>
        <FormField label={t.checkout.zipcode} optional>
          {(a) => <Input {...a} maxLength={10} placeholder={t.checkout.zipcodePh} autoComplete="shipping postal-code" {...bind("zipcode")} />}
        </FormField>
        <FormField label={t.checkout.address1}>
          {(a) => <Input {...a} maxLength={255} placeholder={t.checkout.address1Ph} autoComplete="shipping address-line1" {...bind("address1")} />}
        </FormField>
      </div>
      <FormField label={t.checkout.address2} optional>
        {(a) => <Input {...a} maxLength={255} placeholder={t.checkout.address2Ph} autoComplete="shipping address-line2" {...bind("address2")} />}
      </FormField>
      <FormField label={t.checkout.memo} optional>
        {(a) => <Input {...a} maxLength={255} placeholder={t.checkout.memoPh} autoComplete="off" {...bind("memo")} />}
      </FormField>
    </section>
  );
}
