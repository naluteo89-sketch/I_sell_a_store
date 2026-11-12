import type { Order, OrderForm } from "../types";
import { get, send } from "./http";

export const orderApi = {
  create: (form: OrderForm) => send<Order>("/api/orders", "POST", form),
  pay: (orderNo: string, method: string) =>
    send<Order>(`/api/orders/${encodeURIComponent(orderNo)}/pay`, "POST", { method }),
  /** 주문 때 입력한 연락처가 맞아야 조회된다 (개인정보 보호) */
  get: (orderNo: string, phone: string) =>
    get<Order>(`/api/orders/${encodeURIComponent(orderNo)}?phone=${encodeURIComponent(phone)}`),
};
