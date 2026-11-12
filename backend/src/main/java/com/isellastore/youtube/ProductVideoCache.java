package com.isellastore.youtube;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * 상품별 유튜브 검색 결과 캐시.
 * - videos/fetchedAt : API에서 받은 데이터 → 정책상 30일 안에 갱신하거나 삭제
 * - pinnedVideoIds / excludedVideoIds : 관리자가 직접 고른 값 (영상 ID만 저장)
 */
@Entity
public class ProductVideoCache {

    @Id
    private Long productId;

    private String keyword;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<VideoInfo> videos = new ArrayList<>();

    private Instant fetchedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> pinnedVideoIds = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> excludedVideoIds = new ArrayList<>();

    /** 관리자가 이 상품만 패널을 끄고 싶을 때 */
    private boolean hidden = false;

    protected ProductVideoCache() {}

    public ProductVideoCache(Long productId) {
        this.productId = productId;
    }

    public Long getProductId() { return productId; }
    public String getKeyword() { return keyword; }
    public List<VideoInfo> getVideos() { return videos; }
    public Instant getFetchedAt() { return fetchedAt; }
    public List<String> getPinnedVideoIds() { return pinnedVideoIds; }
    public List<String> getExcludedVideoIds() { return excludedVideoIds; }
    public boolean isHidden() { return hidden; }

    public void updateSearchResult(String keyword, List<VideoInfo> videos) {
        this.keyword = keyword;
        this.videos = new ArrayList<>(videos);
        this.fetchedAt = Instant.now();
    }

    public void clearSearchResult() {
        this.videos = new ArrayList<>();
        this.fetchedAt = null;
    }

    public void setPinnedVideoIds(List<String> ids) { this.pinnedVideoIds = new ArrayList<>(ids); }
    public void setExcludedVideoIds(List<String> ids) { this.excludedVideoIds = new ArrayList<>(ids); }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
}
