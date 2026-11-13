package com.isellastore.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.isellastore.product.dto.ProductDto;

/**
 * 목록용 상품 = 기존 ProductDto 의 모든 필드 + 대표 영상 정보.
 * JSON 은 평평하게 펼쳐져서 기존 프론트 코드가 그대로 읽는다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductCard {

    private final ProductDto product;
    private final String primaryVideoId;
    private final Long videoViewCount;
    private final String channelTitle;

    public ProductCard(ProductDto product, String primaryVideoId, Long videoViewCount, String channelTitle) {
        this.product = product;
        this.primaryVideoId = primaryVideoId;
        this.videoViewCount = videoViewCount;
        this.channelTitle = channelTitle;
    }

    @JsonUnwrapped
    public ProductDto getProduct() { return product; }
    public String getPrimaryVideoId() { return primaryVideoId; }
    public Long getVideoViewCount() { return videoViewCount; }
    public String getChannelTitle() { return channelTitle; }
}
