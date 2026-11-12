package com.isellastore.sourcing.dto;

import com.isellastore.product.domain.Category;
import com.isellastore.product.domain.Product;
import com.isellastore.sourcing.domain.SourcedProduct;
import com.isellastore.sourcing.service.SourcingRules;

/**
 * 프론트엔드용 "사진 + 정보" 목록 1건.
 * - price: 가격 규칙을 적용한 판매가. testPrice = true 면 가격을 못 찾아 넣어 둔 테스트 가격(7701원)
 * - imageUrl / videoThumbnailUrl: 영상 ID로 만든 썸네일 주소 (API 데이터 보관기한과 무관)
 */
public record SourcedItemDto(
        Long productId,
        String name,
        long price,
        boolean testPrice,
        String imageUrl,
        String categorySlug,
        String categoryName,
        String videoId,
        String videoThumbnailUrl
) {
    public static SourcedItemDto from(SourcedProduct s) {
        Product p = s.getProduct();
        Category c = p.getCategory();
        return new SourcedItemDto(
                p.getId(), p.getName(), p.getPrice(),
                s.getPriceSource() == SourcedProduct.PriceSource.TEST,
                p.getImageUrl(),
                c == null ? null : c.getSlug(),
                c == null ? null : c.getName(),
                s.getVideoId(),
                SourcingRules.thumbnailUrl(s.getVideoId())
        );
    }
}
