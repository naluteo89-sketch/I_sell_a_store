package com.isellastore.sourcing.domain;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * 수집 검색어별 "다음 페이지" 위치.
 * 다시 시작해도 이미 본 페이지를 또 검색하지 않는다 (검색 1회 = 100 units 절약).
 */
@Entity
public class SourcingCursor {

    @Id
    @Column(length = 255)
    private String queryText;

    /** 다음에 받을 페이지 토큰 (null = 첫 페이지) */
    @Column(length = 255)
    private String pageToken;

    /** 마지막 페이지까지 다 봤음 */
    private boolean exhausted;

    private Instant updatedAt;

    protected SourcingCursor() {}

    public SourcingCursor(String queryText) {
        this.queryText = queryText;
    }

    public void advance(String nextPageToken) {
        this.pageToken = nextPageToken;
        this.exhausted = nextPageToken == null;
        this.updatedAt = Instant.now();
    }

    public String getQueryText() { return queryText; }
    public String getPageToken() { return pageToken; }
    public boolean isExhausted() { return exhausted; }
    public Instant getUpdatedAt() { return updatedAt; }
}
