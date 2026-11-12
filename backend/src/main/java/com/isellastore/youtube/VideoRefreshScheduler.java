package com.isellastore.youtube;

import com.isellastore.config.StoreProperties;
import com.isellastore.product.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * 매일 새벽 캐시 정리.
 * 1) 보관 상한(30일)을 넘긴 검색 결과는 삭제 (정책 준수)
 * 2) 갱신 주기를 넘긴 캐시를 오래된 순으로, 하루 예산 안에서만 다시 검색
 */
@Component
public class VideoRefreshScheduler {

    private static final Logger log = LoggerFactory.getLogger(VideoRefreshScheduler.class);

    private final ProductVideoCacheRepository caches;
    private final ProductRepository products;
    private final ProductVideoService service;
    private final YoutubeClient youtube;
    private final StoreProperties.Youtube cfg;

    public VideoRefreshScheduler(ProductVideoCacheRepository caches, ProductRepository products,
                                 ProductVideoService service, YoutubeClient youtube, StoreProperties props) {
        this.caches = caches;
        this.products = products;
        this.service = service;
        this.youtube = youtube;
        this.cfg = props.youtube();
    }

    @Scheduled(cron = "0 30 4 * * *", zone = "Asia/Seoul")
    public void run() {
        purgeExpired();
        refreshStale();
    }

    public void purgeExpired() {
        Instant limit = Instant.now().minus(Duration.ofDays(cfg.maxRetentionDays()));
        List<ProductVideoCache> expired = caches.findByFetchedAtBeforeOrderByFetchedAtAsc(limit);
        expired.forEach(ProductVideoCache::clearSearchResult);
        caches.saveAll(expired);
    }

    public void refreshStale() {
        if (!youtube.enabled()) return;
        Instant staleBefore = Instant.now().minus(Duration.ofDays(cfg.refreshAfterDays()));
        List<ProductVideoCache> targets = new ArrayList<>(caches.findByFetchedAtIsNull());
        targets.addAll(caches.findByFetchedAtBeforeOrderByFetchedAtAsc(staleBefore));

        int used = 0;
        for (ProductVideoCache c : targets) {
            if (used >= cfg.dailyRefreshBudget()) break;
            var product = products.findActive(c.getProductId()).orElse(null);
            if (product == null) continue;
            try {
                service.refresh(product);
                used++;
            } catch (Exception e) {
                // 할당량 초과(403) 등은 다음 날 다시 시도
                log.warn("유튜브 캐시 갱신 중단: {}", e.getMessage());
                break;
            }
        }
        log.info("유튜브 캐시 갱신 {}건 (예산 {})", used, cfg.dailyRefreshBudget());
    }
}
