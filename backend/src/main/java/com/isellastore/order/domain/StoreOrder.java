package com.isellastore.order.domain;

import jakarta.persistence.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class StoreOrder {

    private static final SecureRandom RANDOM = new SecureRandom();
    /** 헷갈리는 문자(0,O,1,I) 제외 */
    private static final char[] ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".toCharArray();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 예: ORD-20261112-7KQ2M9XH4C (난수 10자리 ≈ 50비트 → 추측 불가) */
    @Column(nullable = false, unique = true, length = 40)
    private String orderNo;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private long totalAmount;

    private Instant createdAt = Instant.now();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private OrderShipping shipping;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Payment> payments = new ArrayList<>();

    protected StoreOrder() {}

    public StoreOrder(List<OrderItem> items) {
        this.orderNo = newOrderNo();
        items.forEach(this::addItem);
        this.totalAmount = this.items.stream().mapToLong(OrderItem::subtotal).sum();
    }

    private void addItem(OrderItem item) {
        item.attachTo(this);
        items.add(item);
    }

    public void setShipping(OrderShipping shipping) {
        shipping.attachTo(this);
        this.shipping = shipping;
    }

    public Payment startPayment(String method) {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("결제할 수 없는 주문 상태입니다: " + status);
        }
        Payment p = new Payment(this, method, totalAmount);
        payments.add(p);
        return p;
    }

    public void markPaid() {
        this.status = OrderStatus.PAID;
    }

    static String newOrderNo() {
        StringBuilder sb = new StringBuilder("ORD-")
                .append(LocalDate.now(ZoneId.of("Asia/Seoul")).format(DateTimeFormatter.BASIC_ISO_DATE))
                .append('-');
        for (int i = 0; i < 10; i++) sb.append(ALPHABET[RANDOM.nextInt(ALPHABET.length)]);
        return sb.toString();
    }

    public Long getId() { return id; }
    public String getOrderNo() { return orderNo; }
    public OrderStatus getStatus() { return status; }
    public long getTotalAmount() { return totalAmount; }
    public Instant getCreatedAt() { return createdAt; }
    public OrderShipping getShipping() { return shipping; }
    public List<OrderItem> getItems() { return items; }
    public List<Payment> getPayments() { return payments; }
}
