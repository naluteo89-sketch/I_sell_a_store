"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { rememberOrder } from "@/lib/orderSession";

/** 비회원 주문 조회: 주문번호 + 연락처 */
export default function OrderLookupPage() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const no = orderNo.trim().toUpperCase();
    rememberOrder({ orderNo: no, phone });
    router.push(`/orders/${encodeURIComponent(no)}?from=lookup`);
  };

  const input = "w-full rounded-lg border px-3 py-2";
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 py-16">
      <h1 className="text-2xl font-bold">주문 조회</h1>
      <p className="text-sm text-gray-500">주문번호와 주문할 때 입력한 연락처를 넣어 주세요.</p>
      <input required placeholder="주문번호 (예: ORD-20261112-7KQ2M9XH4C)" className={`${input} font-mono`}
        value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
      <input required type="tel" inputMode="tel" placeholder="연락처" className={input}
        value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button className="w-full rounded-xl bg-brand py-3 font-semibold text-white">조회</button>
    </form>
  );
}
