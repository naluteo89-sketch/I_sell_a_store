package com.isellastore.order.domain;

public enum OrderStatus {
    PENDING,   // 주문서 작성, 결제 전
    PAID,      // 결제 완료
    CANCELED
}
