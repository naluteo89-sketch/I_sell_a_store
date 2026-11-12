package com.isellastore.product;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 4000)
    private String description;

    private long price;

    private int stock;

    /** 비어 있으면 프론트에서 기본 이미지로 표시 (데모 이미지는 상업적 사용 가능한 것만) */
    @Column(length = 1000)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    private Category category;

    /** 업종마다 다른 속성(색상, 사이즈, 용량 등)을 구조 변경 없이 담는 칸 */
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata = new HashMap<>();

    /** 유튜브 검색어. 비어 있으면 "상품명 + keyword-suffix"로 검색 */
    private String youtubeKeyword;

    private boolean active = true;

    private Instant createdAt = Instant.now();

    protected Product() {}

    public Product(String name, String description, long price, int stock, Category category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getPrice() { return price; }
    public int getStock() { return stock; }
    public String getImageUrl() { return imageUrl; }
    public Category getCategory() { return category; }
    public Map<String, Object> getMetadata() { return metadata; }
    public String getYoutubeKeyword() { return youtubeKeyword; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(long price) { this.price = price; }
    public void setStock(int stock) { this.stock = stock; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCategory(Category category) { this.category = category; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public void setYoutubeKeyword(String youtubeKeyword) { this.youtubeKeyword = youtubeKeyword; }
    public void setActive(boolean active) { this.active = active; }

    public void decreaseStock(int quantity) {
        if (quantity > stock) {
            throw new IllegalStateException("재고가 부족합니다: " + name);
        }
        this.stock -= quantity;
    }
}
