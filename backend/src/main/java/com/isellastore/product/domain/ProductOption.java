package com.isellastore.product.domain;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/** 옵션 그룹 (예: 색상, 사이즈) */
@Entity
public class ProductOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String name;

    private int sortOrder;

    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ProductOptionValue> values = new ArrayList<>();

    protected ProductOption() {}

    ProductOption(Product product, String name, int sortOrder) {
        this.product = product;
        this.name = name;
        this.sortOrder = sortOrder;
    }

    public ProductOptionValue addValue(String name) {
        ProductOptionValue v = new ProductOptionValue(this, name, values.size());
        values.add(v);
        return v;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getName() { return name; }
    public int getSortOrder() { return sortOrder; }
    public List<ProductOptionValue> getValues() { return values; }

    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
