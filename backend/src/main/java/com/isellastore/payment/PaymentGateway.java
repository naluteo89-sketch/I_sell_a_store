package com.isellastore.payment;

/**
 * 결제사 어댑터 인터페이스.
 * 지금은 MockPaymentGateway(화면만 있는 모의 결제)를 쓰고,
 * 실제 납품 시 포트원·토스페이먼츠 구현체를 추가해 교체한다.
 */
public interface PaymentGateway {

    record PaymentRequest(String orderNo, long amount, String method, String buyerName) {}

    record PaymentResult(boolean success, String transactionId, String message) {}

    PaymentResult pay(PaymentRequest request);
}
