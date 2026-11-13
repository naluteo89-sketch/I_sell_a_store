package com.isellastore.sourcing.dto;

import com.isellastore.global.market.Market;
import com.isellastore.product.domain.Category;
import com.isellastore.product.domain.Product;
import com.isellastore.sourcing.domain.SourcedProduct;
import com.isellastore.sourcing.service.SourcingRules;

/**
 * 프론트엔드용 "사진 + 정보" 목록 1건.
 * - name: 요청 언어의 이름 / lang: 소개한 유튜버 쪽 언어 (ko = 한국 유튜버, en = 영미권 유튜버)
 * - price: 원화 판매가 (가격 규칙 적용, 달러는 환산 후). testPrice = true 면 가격을 못 찾아 넣어 둔 테스트 가격(7701원)
 * - imageUrl / videoThumbnailUrl: 영상 ID로 만든 썸네일 주소 (API 데이터 보관기한과 무관)
 */
public record SourcedItemDto(
        Long productId,
        String name,
        String lang,
        long price,
        boolean testPrice,
        String imageUrl,
        String categorySlug,
        String categoryName,
        String videoId,
        String videoThumbnailUrl
) {
    public static SourcedItemDto from(SourcedProduct s) {
        return from(s, s.getMarket());
    }

    public static SourcedItemDto from(SourcedProduct s, Market market) {
        Product p = s.getProduct();
        Category c = p.getCategory();
        return new SourcedItemDto(
                p.getId(), p.nameFor(market), s.getMarket().lang(), p.getPrice(),
                s.getPriceSource() == SourcedProduct.PriceSource.TEST,
                p.getImageUrl(),
                c == null ? null : c.getSlug(),
                c == null ? null : c.getName(),
                s.getVideoId(),
                SourcingRules.thumbnailUrl(s.getVideoId())
        );
    }
}
