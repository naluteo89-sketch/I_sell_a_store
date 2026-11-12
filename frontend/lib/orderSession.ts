"use client";

/**
 * 주문 조회에는 연락처가 필요하다 (주문번호만으로는 개인정보를 볼 수 없게 함).
 * 방금 주문한 사람이 주문완료 화면을 바로 볼 수 있도록, 탭을 닫으면 사라지는 sessionStorage 에만 잠깐 보관한다.
 * (주소창 URL 에는 연락처를 넣지 않는다)
 */
const KEY = "isellastore-order-access";

export type OrderAccess = { orderNo: string; phone: string };

export function rememberOrder(access: OrderAccess) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(access));
  } catch {
    /* 저장 불가 환경이면 조회 화면에서 연락처를 다시 묻는다 */
  }
}

export function recallOrder(orderNo: string): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as OrderAccess;
    return a.orderNo === orderNo ? a.phone : null;
  } catch {
    return null;
  }
}
