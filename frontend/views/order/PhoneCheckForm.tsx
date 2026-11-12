"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/controllers/useI18n";
import { useDesktopAutofocus } from "@/controllers/useUnsavedChanges";
import Button from "@/views/ui/Button";
import { Input } from "@/views/ui/Field";
import FormField from "@/views/ui/FormField";
import styles from "./OrderForms.module.css";

/** 연락처를 모르는 상태(새 탭·링크 공유)에서 주문을 열면 연락처를 확인한다 */
export default function PhoneCheckForm({
  orderNo, error, onSubmit,
}: { orderNo: string; error: string | null; onSubmit: (phone: string) => void }) {
  const { t } = useI18n();
  const [phone, setPhone] = useState("");
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  useDesktopAutofocus(input);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(phone.trim());
  };
  return (
    <form onSubmit={submit} className={styles.form}>
      <h1 className={styles.title}>{t.order.verifyTitle}</h1>
      <p className={styles.desc}>{t.order.verifyDesc}</p>
      <p className={styles.orderChip}>
        {t.order.orderNo} <strong translate="no">{orderNo}</strong>
      </p>
      <FormField label={t.order.phone} error={error}>
        {(a) => (
          <Input {...a} ref={setInput} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={t.order.phonePh}
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        )}
      </FormField>
      <Button type="submit" size="lg" full>
        {t.order.lookup}
      </Button>
    </form>
  );
}
