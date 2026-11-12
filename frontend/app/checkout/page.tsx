"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PriceLine from "@/components/PriceLine";
import { send, type Order } from "@/lib/api";
import { cartTotal, useCart } from "@/lib/cart";
import { won } from "@/lib/format";
import { useMounted } from "@/lib/useMounted";

/** 결제 수단은 화면만 있는 모의 결제. 실제 결제사 연동 시 백엔드 PaymentGateway만 교체한다. */
const METHODS = [
  { id: "CARD", label: "신용·체크카드" },
  { id: "TRANSFER", label: "계좌이체" },
  { id: "KAKAOPAY", label: "카카오페이" },
  { id: "NAVERPAY", label: "네이버페이" },
  { id: "TOSSPAY", label: "토스페이" },
];

const FIELDS = [
  { key: "buyerName", placeholder: "받는 분" },
  { key: "phone", placeholder: "연락처" },
  { key: "address", placeholder: "주소" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const mounted = useMounted();
  const [form, setForm] = useState({ buyerName: "", phone: "", address: "" });
  const [method, setMethod] = useState("CARD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!mounted) return null;

  if (lines.length === 0) {
    return <p className="py-24 text-center text-gray-500">주문할 상품이 없습니다.</p>;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const order = await send<Order>("/api/orders", "POST", {
        ...form,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      await send<Order>(`/api/orders/${order.orderNo}/pay`, "POST", { method });
      clear();
      router.push(`/orders/${order.orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "주문에 실패했습니다");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-bold">배송 정보</h2>
          {FIELDS.map((f) => (
            <input
              key={f.key}
              required
              placeholder={f.placeholder}
              className="w-full rounded-lg border px-3 py-2"
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          ))}
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

      <div className="h-fit space-y-4 rounded-2xl border p-6">
        <h2 className="font-bold">주문 상품</h2>
        <div className="space-y-1 text-sm">
          {lines.map((l) => (
            <PriceLine key={l.productId} name={l.name} quantity={l.quantity} amount={l.price * l.quantity} />
          ))}
        </div>
        <div className="flex justify-between border-t pt-4 text-lg font-bold">
          <span>결제 금액</span>
          <span>{won(cartTotal(lines))}</span>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50">
          {busy ? "처리 중…" : "결제하기"}
        </button>
      </div>
    </form>
  );
}
