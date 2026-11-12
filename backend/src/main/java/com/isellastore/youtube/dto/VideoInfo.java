package com.isellastore.youtube.dto;

/** 사이드 패널에 표시할 영상 1개. viewCount는 정렬·데모 상품 선정에만 쓰고 가공 지표는 만들지 않는다. */
public record VideoInfo(
        String videoId,
        String title,
        String channelTitle,
        String thumbnailUrl,
        long viewCount
) {}
