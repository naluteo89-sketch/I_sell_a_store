package com.isellastore.product.domain;

import jakarta.persistence.*;

/** 옵션 선택지 (예: 블랙, M) */
@Entity
public class ProductOptionValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private ProductOption option;

    @Column(nullable = false, length = 100)
    private String name;

    private int sortOrder;

    protected ProductOptionValue() {}

    ProductOptionValue(ProductOption option, String name, int sortOrder) {
        this.option = option;
        this.name = name;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public ProductOption getOption() { return option; }
    public String getName() { return name; }
    public int getSortOrder() { return sortOrder; }

    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
