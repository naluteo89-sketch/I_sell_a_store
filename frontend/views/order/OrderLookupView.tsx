"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { rememberOrder } from "@/lib/orderSession";
import Button from "@/views/ui/Button";
import { Input } from "@/views/ui/Field";
import styles from "./OrderForms.module.css";

/** 비회원 주문 조회: 주문번호 + 연락처 */
export default function OrderLookupView() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const no = orderNo.trim().toUpperCase();
    rememberOrder({ orderNo: no, phone });
    router.push(`/orders/${encodeURIComponent(no)}?from=lookup`);
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <h1 className={styles.title}>주문 조회</h1>
      <p className={styles.desc}>주문번호와 주문할 때 입력한 연락처를 넣어 주세요.</p>
      <Input required className={styles.mono} placeholder="주문번호 (예: ORD-20261112-7KQ2M9XH4C)"
        value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
      <Input required type="tel" inputMode="tel" placeholder="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Button type="submit" size="lg" full>
        조회
      </Button>
    </form>
  );
}
