package com.isellastore.order;

import com.isellastore.product.Product;
import com.isellastore.product.ProductVariant;
import jakarta.persistence.*;

/**
 * 주문 상품.
 * productName / optionLabel / unitPrice 는 주문 당시 값을 의도적으로 보관한다
 * (나중에 상품명·가격이 바뀌어도 과거 주문 내역은 그대로여야 하므로 정규화 예외).
 */
@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private StoreOrder order;

    /** 상품이 지워지면 DB가 NULL로 바꾼다 (ON DELETE SET NULL) */
    @ManyToOne(fetch = FetchType.LAZY)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    private ProductVariant variant;

    @Column(nullable = false)
    private String productName;

    private String optionLabel;

    private long unitPrice;

    private int quantity;

    protected OrderItem() {}

    public OrderItem(Product product, ProductVariant variant, int quantity) {
        this.product = product;
        this.variant = variant;
        this.productName = product.getName();
        this.optionLabel = variant == null ? null : variant.label();
        this.unitPrice = variant == null ? product.getPrice() : variant.unitPrice();
        this.quantity = quantity;
    }

    void attachTo(StoreOrder order) {
        this.order = order;
    }

    public long subtotal() {
        return unitPrice * quantity;
    }

    public Long getId() { return id; }
    public StoreOrder getOrder() { return order; }
    public Product getProduct() { return product; }
    public ProductVariant getVariant() { return variant; }
    public String getProductName() { return productName; }
    public String getOptionLabel() { return optionLabel; }
    public long getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
}
