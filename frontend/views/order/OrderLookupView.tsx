"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/controllers/useI18n";
import { useDesktopAutofocus } from "@/controllers/useUnsavedChanges";
import { rememberOrder } from "@/lib/orderSession";
import Button from "@/views/ui/Button";
import { Input } from "@/views/ui/Field";
import FormField from "@/views/ui/FormField";
import styles from "./OrderForms.module.css";

/** 비회원 주문 조회: 주문번호 + 연락처 */
export default function OrderLookupView() {
  const router = useRouter();
  const { t } = useI18n();
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [first, setFirst] = useState<HTMLInputElement | null>(null);
  useDesktopAutofocus(first);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const no = orderNo.trim().toUpperCase();
    rememberOrder({ orderNo: no, phone: phone.trim() });
    router.push(`/orders/${encodeURIComponent(no)}?from=lookup`);
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <h1 className={styles.title}>{t.order.lookupTitle}</h1>
      <p className={styles.desc}>{t.order.lookupDesc}</p>
      <FormField label={t.order.orderNo}>
        {(a) => (
          <Input {...a} ref={setFirst} name="orderNo" className={styles.mono} placeholder={t.order.orderNoPlaceholder}
            autoComplete="off" autoCapitalize="characters" spellCheck={false} translate="no"
            value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
        )}
      </FormField>
      <FormField label={t.order.phone}>
        {(a) => (
          <Input {...a} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={t.order.phonePh}
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        )}
      </FormField>
      <Button type="submit" size="lg" full loading={busy}>
        {t.order.lookup}
      </Button>
    </form>
  );
}
