package com.isellastore.product.dto;

/** 관리자 목록용: 판매 중지·데모 여부와 유튜브 검색어 포함 */
public record AdminProductDto(ProductDto product, boolean active, boolean demo,
                              String youtubeKeyword, String effectiveKeyword) {
}
