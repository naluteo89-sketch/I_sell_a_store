package com.isellastore.sourcing.service;

import com.isellastore.product.domain.Product;
import com.isellastore.product.repository.CategoryRepository;
import com.isellastore.product.repository.ProductRepository;
import com.isellastore.sourcing.domain.SourcedProduct;
import com.isellastore.sourcing.domain.SourcingCursor;
import com.isellastore.sourcing.domain.SourcedProduct.PriceSource;
import com.isellastore.sourcing.repository.SourcedProductRepository;
import com.isellastore.sourcing.repository.SourcingCursorRepository;
import com.isellastore.youtube.dto.VideoInfo;
import com.isellastore.youtube.service.ProductVideoService;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 수집 결과·진행 위치 저장 (건별 트랜잭션 → 중간에 멈춰도 이미 저장한 건 유지) */
@Component
public class SourcingWriter {

    /** 데모 상품 기본 재고 */
    private static final int DEMO_STOCK = 100;

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final SourcedProductRepository sourced;
    private final ProductVideoService videos;
    private final SourcingCursorRepository cursors;

    public SourcingWriter(ProductRepository products, CategoryRepository categories,
                          SourcedProductRepository sourced, ProductVideoService videos,
                          SourcingCursorRepository cursors) {
        this.products = products;
        this.categories = categories;
        this.sourced = sourced;
        this.videos = videos;
        this.cursors = cursors;
    }

    // ───────── 검색어별 진행 위치 ─────────

    @Transactional(readOnly = true)
    public SourcingCursor cursor(String queryText) {
        return cursors.findById(queryText).orElseGet(() -> new SourcingCursor(queryText));
    }

    @Transactional
    public void advance(String queryText, String nextPageToken) {
        SourcingCursor c = cursors.findById(queryText).orElseGet(() -> new SourcingCursor(queryText));
        c.advance(nextPageToken);
        cursors.save(c);
    }

    /** 처음부터 다시 검색하고 싶을 때 */
    @Transactional
    public void resetCursors() {
        cursors.deleteAllInBatch();
    }

    // ───────── 상품 ─────────

    /** 이전 실행에서 이미 처리한 영상인지 */
    @Transactional(readOnly = true)
    public boolean alreadyCollected(String videoId) {
        return sourced.existsByVideoId(videoId);
    }

    /**
     * @param sourcePrice 설명란에서 찾은 금액 (null 이면 테스트 가격)
     * @return 같은 이름 상품이 이미 있으면 false
     */
    @Transactional
    public boolean register(String categorySlug, String name, VideoInfo video, Long sourcePrice) {
        if (products.existsByName(name)) return false;

        PriceSource priceSource = sourcePrice == null ? PriceSource.TEST : PriceSource.DESCRIPTION;
        long price = sourcePrice == null ? SourcingRules.TEST_PRICE : SourcingRules.salePrice(sourcePrice);

        Product p = new Product(name, null, price, DEMO_STOCK, categories.findBySlug(categorySlug).orElse(null));
        p.setImageUrl(SourcingRules.thumbnailUrl(video.videoId()));
        p.setDemo(true);
        products.save(p);

        // 제품을 소개한 영상을 상품 영상 패널에 연결 (추가 검색 없음).
        // 나중에 자동 갱신할 때도 같은 검색어를 쓰도록 키워드 저장
        videos.updateKeyword(p, name);
        videos.store(p, List.of(video));

        sourced.save(new SourcedProduct(p, video.videoId(), name, priceSource, sourcePrice));
        return true;
    }
}
