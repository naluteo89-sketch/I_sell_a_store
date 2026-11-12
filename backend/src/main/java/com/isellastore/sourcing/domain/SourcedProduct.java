package com.isellastore.sourcing.domain;

import com.isellastore.product.domain.Product;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * 유튜브 영상에서 찾아 데모 상품으로 등록한 기록.
 * - 판매가는 product.price. 설명란에서 가격을 못 찾으면 테스트 가격(7701원)으로 올리고 priceSource = TEST
 *   → 나중에 다른 방법(크롤링 등)으로 가격을 채울 대상은 priceSource = TEST 인 것들
 * - 유튜브는 영상 ID만 보관 (제목·조회수 같은 API 데이터는 youtube_video 에서 30일 규칙으로 관리)
 */
@Entity
public class SourcedProduct {

    public enum PriceSource {
        /** 영상 설명란에 적힌 금액에 가격 규칙 적용 */
        DESCRIPTION,
        /** 가격을 못 찾아 테스트 가격으로 등록 */
        TEST
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** 제품을 소개한 영상 (영상 1개에서 제품 여러 개가 나올 수 있음) */
    @Column(nullable = false, length = 20)
    private String videoId;

    /** 설명란에서 뽑은 제품명 (나중에 가격 찾을 때 검색어로 사용) */
    private String searchQuery;

    @Enumerated(EnumType.STRING)
    private PriceSource priceSource;

    /** 설명란에서 찾은 원래 금액 (TEST 면 null) */
    private Long sourcePrice;

    private Instant createdAt = Instant.now();

    protected SourcedProduct() {}

    public SourcedProduct(Product product, String videoId, String searchQuery, PriceSource priceSource, Long sourcePrice) {
        this.product = product;
        this.videoId = videoId;
        this.searchQuery = searchQuery;
        this.priceSource = priceSource;
        this.sourcePrice = sourcePrice;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getVideoId() { return videoId; }
    public String getSearchQuery() { return searchQuery; }
    public PriceSource getPriceSource() { return priceSource; }
    public Long getSourcePrice() { return sourcePrice; }
    public Instant getCreatedAt() { return createdAt; }
}
