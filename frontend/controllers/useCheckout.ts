"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { orderApi } from "@/models/api/orderApi";
import type { ShippingInput } from "@/models/types";
import { rememberOrder } from "@/lib/orderSession";
import { cartTotal, useCart } from "./useCart";

export const PAYMENT_METHODS = [
  { id: "CARD", label: "신용·체크카드" },
  { id: "TRANSFER", label: "계좌이체" },
  { id: "NAVERPAY", label: "네이버페이" },
  { id: "KAKAOPAY", label: "카카오페이" },
  { id: "TOSSPAY", label: "토스페이" },
] as const;

const EMPTY: ShippingInput = { recipientName: "", phone: "", zipcode: "", address1: "", address2: "", memo: "" };

/** C — 주문서: 배송지 입력 → 주문 생성 → 결제(모의) → 주문완료 화면 이동 */
export function useCheckout() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [shipping, setShipping] = useState<ShippingInput>(EMPTY);
  const [method, setMethod] = useState<string>("CARD");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateShipping = (field: keyof ShippingInput, value: string) => setShipping((s) => ({ ...s, [field]: value }));

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

  return {
    lines,
    total: cartTotal(lines),
    shipping,
    updateShipping,
    method,
    setMethod,
    agree,
    setAgree,
    busy,
    error,
    submit,
  };
}
