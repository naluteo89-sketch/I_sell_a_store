package com.isellastore.payment;

import org.springframework.stereotype.Component;

import java.util.UUID;

/** 실제 돈이 오가지 않는 모의 결제. 항상 성공 처리한다. */
@Component
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public PaymentResult pay(PaymentRequest request) {
        String tid = "MOCK-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        return new PaymentResult(true, tid, "모의 결제가 완료되었습니다 (실제 청구 없음)");
    }
}
