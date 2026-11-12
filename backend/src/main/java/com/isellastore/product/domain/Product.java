package com.isellastore.product.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(length = 4000)
    private String description;

    /** 기본 판매가. 조합(variant)이 있으면 조합 추가금을 더한 값이 실제 단가 */
    private long price;

    /** 옵션이 없는 상품의 재고. 옵션 상품은 product_variant.stock 사용 */
    private int stock;

    /** 비어 있으면 프론트에서 기본 이미지로 표시 (데모 이미지는 상업적 사용 가능한 것만) */
    @Column(length = 1000)
    private String imageUrl;

    private boolean active = true;

    /** 데모 상품 표시 (납품 전 일괄 삭제용) */
    private boolean demo = false;

    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ProductAttribute> attributes = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ProductOption> options = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ProductVariant> variants = new ArrayList<>();

    protected Product() {}

    public Product(String name, String description, long price, int stock, Category category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }

    /** 판매 가능한 조합이 하나라도 있으면 옵션 상품 */
    public boolean hasVariants() {
        return variants.stream().anyMatch(ProductVariant::isActive);
    }

    /** 화면에 보여줄 총 재고 */
    public int totalStock() {
        return hasVariants()
                ? variants.stream().filter(ProductVariant::isActive).mapToInt(ProductVariant::getStock).sum()
                : stock;
    }

    public ProductAttribute addAttribute(String name, String value) {
        ProductAttribute a = new ProductAttribute(this, name, value, attributes.size());
        attributes.add(a);
        return a;
    }

    public ProductOption addOption(String name) {
        ProductOption o = new ProductOption(this, name, options.size());
        options.add(o);
        return o;
    }

    public ProductVariant addVariant(List<ProductOptionValue> values, long additionalPrice, int stock) {
        ProductVariant v = new ProductVariant(this, values, additionalPrice, stock);
        variants.add(v);
        return v;
    }

    public Long getId() { return id; }
    public Category getCategory() { return category; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getPrice() { return price; }
    public int getStock() { return stock; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return active; }
    public boolean isDemo() { return demo; }
    public Instant getCreatedAt() { return createdAt; }
    public List<ProductAttribute> getAttributes() { return attributes; }
    public List<ProductOption> getOptions() { return options; }
    public List<ProductVariant> getVariants() { return variants; }

    public void setCategory(Category category) { this.category = category; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(long price) { this.price = price; }
    public void setStock(int stock) { this.stock = stock; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setActive(boolean active) { this.active = active; }
    public void setDemo(boolean demo) { this.demo = demo; }
}
