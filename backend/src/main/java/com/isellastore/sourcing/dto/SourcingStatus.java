package com.isellastore.sourcing.dto;

import java.time.Instant;

/** 수집 작업 진행 상황 */
public record SourcingStatus(
        boolean running,
        boolean stopRequested,
        Instant startedAt,
        Instant finishedAt,
        String currentQuery,
        int youtubeSearches,
        int videosChecked,
        int created,
        /** created 중 설명란에서 가격을 찾은 건수 (나머지는 테스트 가격 7701원) */
        int pricedFromDescription,
        int skipped,
        String stopReason
) {}
