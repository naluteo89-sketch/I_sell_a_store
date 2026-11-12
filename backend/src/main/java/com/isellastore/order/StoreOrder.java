package com.isellastore.order;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class StoreOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNo;

    private String buyerName;
    private String phone;
    private String address;

    private long totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private String paymentMethod;
    private String paymentTransactionId;
    private Instant paidAt;
    private Instant createdAt = Instant.now();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    protected StoreOrder() {}

    public StoreOrder(String buyerName, String phone, String address, List<OrderItem> items) {
        this.orderNo = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.buyerName = buyerName;
        this.phone = phone;
        this.address = address;
        this.items.addAll(items);
        this.totalAmount = items.stream().mapToLong(OrderItem::subtotal).sum();
    }

    public void markPaid(String method, String transactionId) {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("결제할 수 없는 주문 상태입니다: " + status);
        }
        this.status = OrderStatus.PAID;
        this.paymentMethod = method;
        this.paymentTransactionId = transactionId;
        this.paidAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getOrderNo() { return orderNo; }
    public String getBuyerName() { return buyerName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public long getTotalAmount() { return totalAmount; }
    public OrderStatus getStatus() { return status; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentTransactionId() { return paymentTransactionId; }
    public Instant getPaidAt() { return paidAt; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }
}
