package com.isellastore.order.domain;

import jakarta.persistence.*;

import java.time.Instant;

/** 결제 시도 1건. 실패 후 재시도하면 행이 하나 더 쌓인다. */
@Entity
public class Payment {

    public enum Status { READY, PAID, FAILED, CANCELED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private StoreOrder order;

    @Column(nullable = false, length = 30)
    private String method;

    private long amount;

    @Enumerated(EnumType.STRING)
    private Status status = Status.READY;

    @Column(length = 100)
    private String transactionId;

    @Column(length = 500)
    private String failReason;

    private Instant requestedAt = Instant.now();

    private Instant paidAt;

    protected Payment() {}

    Payment(StoreOrder order, String method, long amount) {
        this.order = order;
        this.method = method;
        this.amount = amount;
    }

    public void succeed(String transactionId) {
        this.status = Status.PAID;
        this.transactionId = transactionId;
        this.paidAt = Instant.now();
    }

    public void fail(String reason) {
        this.status = Status.FAILED;
        this.failReason = reason;
    }

    public Long getId() { return id; }
    public String getMethod() { return method; }
    public long getAmount() { return amount; }
    public Status getStatus() { return status; }
    public String getTransactionId() { return transactionId; }
    public String getFailReason() { return failReason; }
    public Instant getRequestedAt() { return requestedAt; }
    public Instant getPaidAt() { return paidAt; }
}
