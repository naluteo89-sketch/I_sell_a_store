package com.isellastore.order;

import jakarta.persistence.*;

@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    /** 주문 시점의 상품명·가격을 그대로 남긴다 (나중에 상품이 바뀌어도 주문 내역은 유지) */
    private String productName;
    private long unitPrice;
    private int quantity;

    protected OrderItem() {}

    public OrderItem(Long productId, String productName, long unitPrice, int quantity) {
        this.productId = productId;
        this.productName = productName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public long getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public long subtotal() { return unitPrice * quantity; }
}
