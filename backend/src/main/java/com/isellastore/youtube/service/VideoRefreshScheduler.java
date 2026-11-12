package com.isellastore.youtube.service;

import com.isellastore.global.config.StoreProperties;
import com.isellastore.product.domain.Product;
import com.isellastore.product.repository.ProductRepository;
import com.isellastore.youtube.client.YoutubeClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * 매일 새벽 04:30
 * 1) 보관 상한(30일)을 넘긴 유튜브 데이터 정리 (정책 준수)
 * 2) 갱신 주기를 넘긴 상품부터, 하루 예산(daily-refresh-budget) 안에서만 다시 검색
 */
@Component
public class VideoRefreshScheduler {

    private static final Logger log = LoggerFactory.getLogger(VideoRefreshScheduler.class);

    private final ProductRepository products;
    private final ProductVideoService service;
    private final YoutubeClient youtube;
    private final StoreProperties.Youtube cfg;

    public VideoRefreshScheduler(ProductRepository products, ProductVideoService service,
                                 YoutubeClient youtube, StoreProperties props) {
        this.products = products;
        this.service = service;
        this.youtube = youtube;
        this.cfg = props.youtube();
    }

    @Scheduled(cron = "0 30 4 * * *", zone = "Asia/Seoul")
    public void run() {
        service.purgeExpired();
        refreshStale();
    }

    public void refreshStale() {
        if (!youtube.enabled()) return;
        Instant staleBefore = Instant.now().minus(Duration.ofDays(cfg.refreshAfterDays()));

        // 한 번도 검색 안 한 상품 → 오래된 순
        List<Product> targets = products.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(p -> lastFetched(p).isBefore(staleBefore))
                .sorted(Comparator.comparing(this::lastFetched))
                .toList();

        int used = 0;
        for (Product p : targets) {
            if (used >= cfg.dailyRefreshBudget()) break;
            try {
                service.refresh(p);
                used++;
            } catch (Exception e) {
                // 할당량 초과(403) 등은 다음 날 다시 시도
                log.warn("유튜브 갱신 중단: {}", e.getMessage());
                break;
            }
        }
        log.info("유튜브 갱신 {}건 (예산 {})", used, cfg.dailyRefreshBudget());
    }

    /** 한 번도 검색 안 했으면 가장 오래된 것으로 취급 */
    private Instant lastFetched(Product p) {
        var s = service.settingOf(p.getId());
        return (s == null || s.getFetchedAt() == null) ? Instant.EPOCH : s.getFetchedAt();
    }
}
