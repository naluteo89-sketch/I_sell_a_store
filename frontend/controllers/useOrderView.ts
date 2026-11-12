"use client";

import { useCallback, useEffect, useState } from "react";
import { orderApi } from "@/models/api/orderApi";
import type { Order } from "@/models/types";
import { recallOrder, rememberOrder } from "@/lib/orderSession";

type State = "loading" | "ask" | "done";

/** C — 주문 조회: 방금 주문했으면 바로, 아니면 연락처 확인 후 조회 */
export function useOrderView(orderNo: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState(false);

  const load = useCallback(
    async (phone: string) => {
      setState("loading");
      setError(false);
      try {
        const o = await orderApi.get(orderNo, phone);
        rememberOrder({ orderNo, phone });
        setOrder(o);
        setState("done");
      } catch {
        setError(true);
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

  return { order, state, error, verify: load };
}
