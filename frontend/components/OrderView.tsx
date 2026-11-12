"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { fetchOrder, type Order } from "@/lib/api";
import { won } from "@/lib/format";
import { recallOrder, rememberOrder } from "@/lib/orderSession";

const STATUS: Record<Order["status"], string> = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  CANCELED: "취소됨",
};

/** 연락처를 모르는 상태에서 여는 경우(새 탭, 링크 공유 등)엔 연락처를 물어본다 */
export default function OrderView({ orderNo, justOrdered = false }: { orderNo: string; justOrdered?: boolean }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"loading" | "ask" | "done">("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (p: string) => {
      try {
        const o = await fetchOrder(orderNo, p);
        rememberOrder({ orderNo, phone: p });
        setOrder(o);
        setState("done");
      } catch {
        setError("주문번호와 연락처가 일치하는 주문이 없습니다.");
        setState("ask");
      }
    },
    [orderNo],
  );

  useEffect(() => {
    const saved = recallOrder(orderNo);
    if (saved) load(saved);
    else setState("ask");
  }, [orderNo, load]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    load(phone);
  };

  if (state === "loading") return <p className="py-24 text-center text-gray-400">주문 정보를 불러오는 중…</p>;

  if (state === "ask" || !order) {
    return (
      <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 py-16">
        <h1 className="text-xl font-bold">주문 확인</h1>
        <p className="text-sm text-gray-500">
          주문번호 <span className="font-mono">{orderNo}</span>
          <br />
          개인정보 보호를 위해 주문할 때 입력한 연락처를 확인합니다.
        </p>
        <input required type="tel" inputMode="tel" placeholder="연락처" value={phone}
          onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-xl bg-brand py-3 font-semibold text-white">조회</button>
      </form>
    );
  }

  const s = order.shipping;
  return (
    <div className="mx-auto max-w-xl space-y-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {justOrdered && order.status === "PAID" ? "주문이 완료되었습니다" : `주문 ${STATUS[order.status]}`}
        </h1>
        <p className="mt-2 font-mono text-sm text-gray-500">{order.orderNo}</p>
        {justOrdered && <p className="mt-1 text-xs text-gray-400">주문번호를 저장해 두세요. 주문 조회에 필요합니다.</p>}
      </div>

      <div className="space-y-2 rounded-2xl border p-6 text-sm">
        {order.items.map((i, idx) => (
          <div key={idx} className="flex justify-between gap-2">
            <span>
              {i.productName}
              {i.optionLabel && <span className="text-gray-500"> ({i.optionLabel})</span>} × {i.quantity}
            </span>
            <span className="shrink-0">{won(i.unitPrice * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 text-base font-bold">
          <span>결제 금액</span>
          <span>{won(order.totalAmount)}</span>
        </div>
        {order.payment && (
          <p className="text-gray-500">
            결제 수단 {order.payment.method} · {order.payment.status === "PAID" ? "결제 완료" : order.payment.status}
          </p>
        )}
      </div>

      {s && (
        <div className="space-y-1 rounded-2xl border p-6 text-sm">
          <p className="font-semibold">배송지</p>
          <p>
            {s.recipientName} · {s.phone}
          </p>
          <p className="text-gray-600">
            {s.zipcode && `(${s.zipcode}) `}
            {s.address1} {s.address2}
          </p>
          {s.memo && <p className="text-gray-500">요청사항: {s.memo}</p>}
        </div>
      )}

      <div className="text-center">
        <Link href="/products" className="inline-block rounded-full bg-brand px-6 py-3 text-sm text-white">
          계속 쇼핑하기
        </Link>
      </div>
    </div>
  );
}
