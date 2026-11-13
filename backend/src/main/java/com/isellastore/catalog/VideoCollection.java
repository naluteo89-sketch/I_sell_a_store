package com.isellastore.catalog;

import java.util.List;

/** 영상 하나 + 그 영상에서 소개한 상품들 (목록에서는 미리보기 최대 4개, 상세에서는 전부) */
public record VideoCollection(VideoSummary video, int productCount, List<ProductCard> products) {}
