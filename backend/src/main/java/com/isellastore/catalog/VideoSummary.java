package com.isellastore.catalog;

/** 영상 한 개 요약 (프론트 Video 타입과 같은 이름) */
public record VideoSummary(
        String videoId,
        String title,
        String channelTitle,
        String thumbnailUrl,
        long viewCount,
        long channelViewCount,
        int productCount
) {}
