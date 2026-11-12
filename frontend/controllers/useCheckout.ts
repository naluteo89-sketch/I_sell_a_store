"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { orderApi } from "@/models/api/orderApi";
import type { ShippingInput } from "@/models/types";
import { rememberOrder } from "@/lib/orderSession";
import { cartTotal, useCart } from "./useCart";
import { useI18n } from "./useI18n";
import { useUnsavedChanges } from "./useUnsavedChanges";

/** 결제 수단 ID (라벨은 사전 t.checkout.methods) */
export const PAYMENT_METHODS = ["CARD", "TRANSFER", "NAVERPAY", "KAKAOPAY", "TOSSPAY"] as const;

const EMPTY: ShippingInput = { recipientName: "", phone: "", zipcode: "", address1: "", address2: "", memo: "" };

/** C — 주문서: 배송지 입력 → 주문 생성 → 결제(모의) → 주문완료 화면 이동 */
export function useCheckout() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { lines, clear } = useCart();
  const [shipping, setShipping] = useState<ShippingInput>(EMPTY);
  const [method, setMethod] = useState<string>("CARD");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateShipping = (field: keyof ShippingInput, value: string) => setShipping((s) => ({ ...s, [field]: value }));

  // 배송 정보를 입력하다가 새로고침·탭 닫기 하면 확인
  const [done, setDone] = useState(false);
  useUnsavedChanges(!done && Object.values(shipping).some((v) => v.trim() !== ""));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // 자동 완성·문자 대치로 붙은 앞뒤 공백 제거
      const trimmed = Object.fromEntries(Object.entries(shipping).map(([k, v]) => [k, v.trim()])) as ShippingInput;
      const order = await orderApi.create({
        shipping: trimmed,
        items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
      });
      await orderApi.pay(order.orderNo, method);
      rememberOrder({ orderNo: order.orderNo, phone: trimmed.phone });
      setDone(true);
      clear();
      router.push(`/orders/${order.orderNo}`);
    } catch (err) {
      // 백엔드 오류 문구는 한국어라, 영어 화면에서는 일반 안내로 바꾼다
      setError(locale === "ko" && err instanceof Error ? err.message : t.checkout.failed);
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
