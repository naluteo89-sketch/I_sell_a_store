package com.isellastore.product.domain;

import jakarta.persistence.*;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** 옵션 조합 (예: 블랙 + M) 별 재고·추가금 */
@Entity
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;

    @Column(length = 100, unique = true)
    private String sku;

    private long additionalPrice;

    private int stock;

    private boolean active = true;

    @ManyToMany
    @JoinTable(
            name = "variant_option_value",
            joinColumns = @JoinColumn(name = "variant_id"),
            inverseJoinColumns = @JoinColumn(name = "option_value_id")
    )
    private Set<ProductOptionValue> optionValues = new HashSet<>();

    protected ProductVariant() {}

    ProductVariant(Product product, List<ProductOptionValue> values, long additionalPrice, int stock) {
        this.product = product;
        this.optionValues.addAll(values);
        this.additionalPrice = additionalPrice;
        this.stock = stock;
    }

    /** 옵션 순서대로 정렬한 선택지 */
    public List<ProductOptionValue> sortedValues() {
        return optionValues.stream()
                .sorted(Comparator.comparingInt((ProductOptionValue v) -> v.getOption().getSortOrder())
                        .thenComparingInt(ProductOptionValue::getSortOrder))
                .toList();
    }

    /** 화면·주문내역 표시용 (예: "블랙 / M") */
    public String label() {
        return sortedValues().stream().map(ProductOptionValue::getName).collect(Collectors.joining(" / "));
    }

    /** 조합을 구분하는 키 (예: "색상=블랙|사이즈=M") */
    public String combinationKey() {
        return sortedValues().stream()
                .map(v -> v.getOption().getName() + "=" + v.getName())
                .collect(Collectors.joining("|"));
    }

    public long unitPrice() {
        return product.getPrice() + additionalPrice;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getSku() { return sku; }
    public long getAdditionalPrice() { return additionalPrice; }
    public int getStock() { return stock; }
    public boolean isActive() { return active; }
    public Set<ProductOptionValue> getOptionValues() { return optionValues; }

    public void setSku(String sku) { this.sku = (sku == null || sku.isBlank()) ? null : sku; }
    public void setAdditionalPrice(long additionalPrice) { this.additionalPrice = additionalPrice; }
    public void setStock(int stock) { this.stock = stock; }
    public void setActive(boolean active) { this.active = active; }
}
