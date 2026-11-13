package com.isellastore.sourcing.dto;

import com.isellastore.sourcing.domain.SourcedProduct;

import java.time.Instant;

/** 관리자 확인용: 프론트용 정보 + 가격 출처·설명란 원래 금액·검색어 */
public record AdminSourcedItemDto(
        SourcedItemDto item,
        boolean active,
        SourcedProduct.PriceSource priceSource,
        /** 설명란 원래 금액. 단위: sourceCurrency 가 KRW 면 원, USD 면 센트 */
        Long sourcePrice,
        String sourceCurrency,
        String searchQuery,
        Instant createdAt
) {
    public static AdminSourcedItemDto from(SourcedProduct s) {
        return new AdminSourcedItemDto(SourcedItemDto.from(s), s.getProduct().isActive(), s.getPriceSource(),
                s.getSourcePrice(), s.getSourceCurrency(), s.getSearchQuery(), s.getCreatedAt());
    }
}
