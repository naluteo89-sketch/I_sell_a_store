package com.isellastore.youtube.domain;

import com.isellastore.product.domain.Product;

import jakarta.persistence.*;

import java.time.Instant;

/** 상품별 유튜브 검색 설정 (상품과 1:1, product_id 가 기본키) */
@Entity
public class ProductYoutubeSetting {

    @Id
    private Long productId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    /** null 이면 "상품명 + keyword-suffix" */
    private String keyword;

    private boolean hidden = false;

    /** 마지막 검색 시각 */
    private Instant fetchedAt;

    protected ProductYoutubeSetting() {}

    public ProductYoutubeSetting(Product product) {
        this.product = product;
    }

    public Long getProductId() { return productId; }
    public Product getProduct() { return product; }
    public String getKeyword() { return keyword; }
    public boolean isHidden() { return hidden; }
    public Instant getFetchedAt() { return fetchedAt; }

    public void setKeyword(String keyword) { this.keyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim(); }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
    public void markFetched() { this.fetchedAt = Instant.now(); }
}
