package com.isellastore.youtube.domain;

import com.isellastore.product.domain.Product;

import jakarta.persistence.*;

/** 상품 ↔ 영상 연결. 고정·제외·검색 순위를 영상별로 따로 관리한다. */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_product_video", columnNames = {"product_id", "video_id"}))
public class ProductVideo {

    public enum Source { SEARCH, MANUAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id")
    private YoutubeVideo video;

    @Enumerated(EnumType.STRING)
    private Source source;

    private boolean pinned = false;

    private boolean excluded = false;

    private int rankNo;

    protected ProductVideo() {}

    public ProductVideo(Product product, YoutubeVideo video, Source source, int rankNo) {
        this.product = product;
        this.video = video;
        this.source = source;
        this.rankNo = rankNo;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public YoutubeVideo getVideo() { return video; }
    public Source getSource() { return source; }
    public boolean isPinned() { return pinned; }
    public boolean isExcluded() { return excluded; }
    public int getRankNo() { return rankNo; }

    public void setPinned(boolean pinned) { this.pinned = pinned; }
    public void setExcluded(boolean excluded) { this.excluded = excluded; }
    public void setRankNo(int rankNo) { this.rankNo = rankNo; }
}
