"use client";

import { useState, type FormEvent } from "react";
import Button from "@/views/ui/Button";
import { Input } from "@/views/ui/Field";
import styles from "./OrderForms.module.css";

/** 연락처를 모르는 상태(새 탭·링크 공유)에서 주문을 열면 연락처를 확인한다 */
export default function PhoneCheckForm({
  orderNo, error, onSubmit,
}: { orderNo: string; error: string | null; onSubmit: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(phone);
  };
  return (
    <form onSubmit={submit} className={styles.form}>
      <h1 className={styles.title}>주문 확인</h1>
      <p className={styles.desc}>
        주문번호 <span className={styles.mono}>{orderNo}</span>
        <br />
        개인정보 보호를 위해 주문할 때 입력한 연락처를 확인합니다.
      </p>
      <Input required type="tel" inputMode="tel" placeholder="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} />
      {error && <p className={styles.error}>{error}</p>}
      <Button type="submit" size="lg" full>
        조회
      </Button>
    </form>
  );
}
