"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { orderApi } from "@/lib/api";
import { cartTotal, useCart } from "@/lib/cart";
import { won } from "@/lib/format";
import { rememberOrder } from "@/lib/orderSession";

/** 결제 수단은 화면만 있는 모의 결제. 실제 결제사 연동 시 백엔드 PaymentGateway 만 교체한다. */
const METHODS = [
  { id: "CARD", label: "신용·체크카드" },
  { id: "TRANSFER", label: "계좌이체" },
  { id: "NAVERPAY", label: "네이버페이" },
  { id: "KAKAOPAY", label: "카카오페이" },
  { id: "TOSSPAY", label: "토스페이" },
];

const EMPTY = { recipientName: "", phone: "", zipcode: "", address1: "", address2: "", memo: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [shipping, setShipping] = useState(EMPTY);
  const [method, setMethod] = useState("CARD");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (lines.length === 0) {
    return <p className="py-24 text-center text-gray-500">주문할 상품이 없습니다.</p>;
  }

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setShipping((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const order = await orderApi.create({
        shipping,
        items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
      });
      await orderApi.pay(order.orderNo, method);
      rememberOrder({ orderNo: order.orderNo, phone: shipping.phone });
      clear();
      router.push(`/orders/${order.orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "주문에 실패했습니다");
      setBusy(false);
    }
  };

  const input = "w-full rounded-lg border px-3 py-2";

  return (
    <form onSubmit={submit} className="grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">주문서</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">배송 정보</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input required maxLength={100} placeholder="받는 분" className={input}
              value={shipping.recipientName} onChange={set("recipientName")} autoComplete="name" />
            <input required type="tel" inputMode="tel" pattern="[0-9\-+ ]{8,20}" placeholder="연락처 (주문 조회에 사용)"
              className={input} value={shipping.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <input maxLength={10} inputMode="numeric" placeholder="우편번호" className={input}
              value={shipping.zipcode} onChange={set("zipcode")} autoComplete="postal-code" />
            <input required maxLength={255} placeholder="기본 주소" className={input}
              value={shipping.address1} onChange={set("address1")} autoComplete="address-line1" />
          </div>
          <input maxLength={255} placeholder="상세 주소 (동·호수)" className={input}
            value={shipping.address2} onChange={set("address2")} autoComplete="address-line2" />
          <input maxLength={255} placeholder="배송 요청사항 (선택)" className={input}
            value={shipping.memo} onChange={set("memo")} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">결제 수단</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`rounded-xl border py-3 text-sm ${
                  method === m.id ? "border-brand bg-brand text-white" : "hover:border-gray-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">데모 사이트입니다. 실제 결제는 이루어지지 않습니다.</p>
        </section>
      </div>

      <div className="h-fit space-y-4 rounded-2xl border p-6 lg:sticky lg:top-24">
        <h2 className="font-bold">주문 상품</h2>
        <ul className="space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-2">
              <span>
                {l.name}
                {l.optionLabel && <span className="text-gray-500"> ({l.optionLabel})</span>} × {l.quantity}
              </span>
              <span className="shrink-0">{won(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t pt-4 text-lg font-bold">
          <span>결제 금액</span>
          <span>{won(cartTotal(lines))}</span>
        </div>
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
          주문 내용을 확인했으며, 배송을 위한 개인정보 수집·이용에 동의합니다.
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50">
          {busy ? "처리 중…" : `${won(cartTotal(lines))} 결제하기`}
        </button>
      </div>
    </form>
  );
}
