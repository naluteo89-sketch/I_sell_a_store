package com.isellastore.youtube;

import com.isellastore.config.StoreProperties;
import com.isellastore.product.Product;
import com.isellastore.product.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * 상품별 유튜브 영상 관리.
 * - 방문자 조회(videosFor)는 DB만 읽고 유튜브 검색을 호출하지 않는다.
 * - 검색은 상품 등록·관리자 재검색·스케줄러에서만 (search.list 1회 = 100 units, 하루 기본 100회)
 */
@Service
public class ProductVideoService {

    private static final Logger log = LoggerFactory.getLogger(ProductVideoService.class);

    private final ProductVideoRepository links;
    private final YoutubeVideoRepository videos;
    private final ProductYoutubeSettingRepository settings;
    private final ProductRepository products;
    private final YoutubeClient youtube;
    private final StoreProperties.Youtube cfg;

    public ProductVideoService(ProductVideoRepository links, YoutubeVideoRepository videos,
                               ProductYoutubeSettingRepository settings, ProductRepository products,
                               YoutubeClient youtube, StoreProperties props) {
        this.links = links;
        this.videos = videos;
        this.settings = settings;
        this.products = products;
        this.youtube = youtube;
        this.cfg = props.youtube();
    }

    // ───────── 조회 ─────────

    /** 방문자용: 고정 → 검색 순위, 제외 영상 빠짐 */
    @Transactional(readOnly = true)
    public List<VideoInfo> videosFor(Long productId) {
        ProductYoutubeSetting s = settings.findById(productId).orElse(null);
        if (s != null && s.isHidden()) return List.of();
        return links.findAllForProduct(productId).stream()
                .filter(pv -> !pv.isExcluded())
                .map(pv -> pv.getVideo().toInfo())
                .toList();
    }

    /** 관리자용: 제외 포함 전체 연결 */
    @Transactional(readOnly = true)
    public List<ProductVideo> linksOf(Long productId) {
        return links.findAllForProduct(productId);
    }

    @Transactional(readOnly = true)
    public ProductYoutubeSetting settingOf(Long productId) {
        return settings.findById(productId).orElse(null);
    }

    public String keywordFor(Product p) {
        ProductYoutubeSetting s = settings.findById(p.getId()).orElse(null);
        return (s != null && s.getKeyword() != null) ? s.getKeyword() : p.getName() + cfg.keywordSuffix();
    }

    // ───────── 설정 ─────────

    @Transactional
    public void updateKeyword(Product p, String keyword) {
        setting(p).setKeyword(keyword);
    }

    private ProductYoutubeSetting setting(Product p) {
        return settings.findById(p.getId()).orElseGet(() -> settings.save(new ProductYoutubeSetting(p)));
    }

    // ───────── 검색 결과 반영 ─────────

    /** 관리자·스케줄러용. search.list 1회(100 units) 사용. */
    @Transactional
    public void refresh(Product p) {
        if (!youtube.enabled()) return;
        String keyword = keywordFor(p);
        apply(p, youtube.search(keyword, cfg.maxResults(), YoutubeClient.Order.RELEVANCE));
    }

    /** 데모 seed 때 이미 받아 둔 검색 결과를 그대로 저장 (추가 검색 없음) */
    @Transactional
    public void store(Product p, List<VideoInfo> found) {
        apply(p, found);
    }

    /** 실패해도 상품 등록은 막지 않는다 */
    public void refreshQuietly(Product p) {
        try {
            refresh(p);
        } catch (Exception e) {
            log.warn("유튜브 검색 실패 (상품 {}): {}", p.getId(), e.getMessage());
        }
    }

    private void apply(Product p, List<VideoInfo> found) {
        Map<String, ProductVideo> existing = new HashMap<>();
        for (ProductVideo pv : links.findAllForProduct(p.getId())) existing.put(pv.getVideo().getVideoId(), pv);

        Set<String> foundIds = new HashSet<>();
        found.forEach(f -> foundIds.add(f.videoId()));

        // 지난 검색 결과 중 이번에 없는 것 정리 (고정·제외 표시가 있는 건 유지)
        for (ProductVideo pv : existing.values()) {
            if (pv.getSource() == ProductVideo.Source.SEARCH && !pv.isPinned() && !pv.isExcluded()
                    && !foundIds.contains(pv.getVideo().getVideoId())) {
                links.delete(pv);
            }
        }

        int rank = 0;
        for (VideoInfo info : found) {
            YoutubeVideo v = videos.findById(info.videoId()).orElseGet(() -> new YoutubeVideo(info.videoId()));
            v.updateFrom(info);
            videos.save(v);
            ProductVideo pv = existing.get(info.videoId());
            if (pv == null) links.save(new ProductVideo(p, v, ProductVideo.Source.SEARCH, rank));
            else pv.setRankNo(rank);
            rank++;
        }
        setting(p).markFetched();
    }

    // ───────── 관리자 큐레이션 ─────────

    /** null 인 항목은 바꾸지 않는다 */
    @Transactional
    public void curate(Long productId, List<String> pinnedIds, List<String> excludedIds, Boolean hidden) {
        Product p = products.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Map<String, ProductVideo> existing = new LinkedHashMap<>();
        for (ProductVideo pv : links.findAllForProduct(productId)) existing.put(pv.getVideo().getVideoId(), pv);

        if (pinnedIds != null) {
            Set<String> pinned = new LinkedHashSet<>(pinnedIds);
            existing.values().forEach(pv -> pv.setPinned(pinned.contains(pv.getVideo().getVideoId())));
            List<String> newIds = pinned.stream().filter(id -> !existing.containsKey(id)).toList();
            Map<String, VideoInfo> details = new HashMap<>();
            youtube.videosById(newIds).forEach(i -> details.put(i.videoId(), i)); // 1 unit, 키 없으면 빈 목록
            for (String id : newIds) {
                YoutubeVideo v = videos.findById(id).orElseGet(() -> new YoutubeVideo(id));
                if (details.containsKey(id)) v.updateFrom(details.get(id));
                videos.save(v);
                ProductVideo pv = new ProductVideo(p, v, ProductVideo.Source.MANUAL, 0);
                pv.setPinned(true);
                existing.put(id, links.save(pv));
            }
        }
        if (excludedIds != null) {
            Set<String> excluded = new HashSet<>(excludedIds);
            existing.values().forEach(pv -> pv.setExcluded(excluded.contains(pv.getVideo().getVideoId())));
        }
        // 직접 추가했다가 고정·제외를 모두 푼 영상은 연결 삭제
        existing.values().stream()
                .filter(pv -> pv.getSource() == ProductVideo.Source.MANUAL && !pv.isPinned() && !pv.isExcluded())
                .forEach(links::delete);

        if (hidden != null) setting(p).setHidden(hidden);
    }

    // ───────── 정책: 30일 보관 상한 ─────────

    /** 30일 지난 API 데이터 정리. 검색 링크는 삭제, 고정 영상은 ID만 남김. */
    @Transactional
    public void purgeExpired() {
        Instant limit = Instant.now().minus(Duration.ofDays(cfg.maxRetentionDays()));
        int removedLinks = links.deleteExpiredSearchLinks(limit);
        List<YoutubeVideo> expired = videos.findByFetchedAtBefore(limit);
        expired.forEach(YoutubeVideo::clearApiData);
        int orphans = videos.deleteOrphans();
        log.info("유튜브 보관기한 정리: 링크 {}건 삭제, 영상 {}건 정보 비움, 고아 영상 {}건 삭제",
                removedLinks, expired.size(), orphans);
    }
}
