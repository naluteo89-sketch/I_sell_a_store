package com.isellastore.product.domain;

import jakarta.persistence.*;

/** 상품 사양 (소재, 원산지 등 고르지 않는 표시용 정보) */
@Entity
public class ProductAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "attr_value", nullable = false, length = 500)
    private String value;

    private int sortOrder;

    protected ProductAttribute() {}

    ProductAttribute(Product product, String name, String value, int sortOrder) {
        this.product = product;
        this.name = name;
        this.value = value;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getValue() { return value; }
    public int getSortOrder() { return sortOrder; }

    public void update(String value, int sortOrder) {
        this.value = value;
        this.sortOrder = sortOrder;
    }
}
