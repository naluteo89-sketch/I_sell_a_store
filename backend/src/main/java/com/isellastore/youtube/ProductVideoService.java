package com.isellastore.youtube;

import com.isellastore.config.StoreProperties;
import com.isellastore.product.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProductVideoService {

    private static final Logger log = LoggerFactory.getLogger(ProductVideoService.class);

    private final ProductVideoCacheRepository caches;
    private final YoutubeClient youtube;
    private final StoreProperties.Youtube cfg;

    public ProductVideoService(ProductVideoCacheRepository caches, YoutubeClient youtube, StoreProperties props) {
        this.caches = caches;
        this.youtube = youtube;
        this.cfg = props.youtube();
    }

    /**
     * 방문자용. 캐시만 읽고 유튜브 검색은 절대 호출하지 않는다.
     * 순서: 고정(핀) 영상 → 검색 결과 (제외 목록은 빠짐)
     */
    @Transactional(readOnly = true)
    public List<VideoInfo> videosFor(Long productId) {
        ProductVideoCache cache = cacheOf(productId);
        if (cache.isHidden()) return List.of();

        Set<String> excluded = new HashSet<>(cache.getExcludedVideoIds());
        Map<String, VideoInfo> byId = new LinkedHashMap<>();
        for (VideoInfo v : cache.getVideos()) byId.put(v.videoId(), v);

        List<VideoInfo> out = new ArrayList<>();
        for (String pinned : cache.getPinnedVideoIds()) {
            if (excluded.contains(pinned)) continue;
            // 핀 영상은 ID만 저장하므로, 검색 결과에 없으면 ID만으로 표시 (썸네일은 프론트에서 ID로 만듦)
            out.add(byId.getOrDefault(pinned, new VideoInfo(pinned, null, null, null, 0)));
        }
        for (VideoInfo v : cache.getVideos()) {
            if (excluded.contains(v.videoId()) || cache.getPinnedVideoIds().contains(v.videoId())) continue;
            out.add(v);
        }
        return out;
    }

    /** 캐시가 없으면 빈 캐시(저장 전)를 돌려준다 → 호출하는 쪽에서 null 확인 불필요 */
    @Transactional(readOnly = true)
    public ProductVideoCache cacheOf(Long productId) {
        return caches.findById(productId).orElseGet(() -> new ProductVideoCache(productId));
    }

    public String keywordFor(Product p) {
        String k = p.getYoutubeKeyword();
        return (k != null && !k.isBlank()) ? k : defaultKeyword(p.getName());
    }

    /** "상품명 + keyword-suffix" (예: "에어팟 리뷰") */
    public String defaultKeyword(String productName) {
        return productName + cfg.keywordSuffix();
    }

    /** 관리자·스케줄러용. search.list 1회(100 units) 사용. */
    @Transactional
    public ProductVideoCache refresh(Product p) {
        String keyword = keywordFor(p);
        List<VideoInfo> found = youtube.search(keyword, cfg.maxResults(), YoutubeClient.Order.RELEVANCE);
        ProductVideoCache cache = cacheOf(p.getId());
        if (youtube.enabled()) {
            cache.updateSearchResult(keyword, found);
        }
        return caches.save(cache);
    }

    /** 데모 상품 seed 때 이미 받아 둔 검색 결과를 그대로 캐시에 넣는다 (추가 검색 없음). */
    @Transactional
    public void store(Long productId, String keyword, List<VideoInfo> videos) {
        ProductVideoCache cache = cacheOf(productId);
        cache.updateSearchResult(keyword, videos);
        caches.save(cache);
    }

    /** 실패해도 상품 등록은 막지 않는다. */
    public void refreshQuietly(Product p) {
        try {
            refresh(p);
        } catch (Exception e) {
            log.warn("유튜브 캐시 생성 실패 (상품 {}): {}", p.getId(), e.getMessage());
        }
    }

    @Transactional
    public ProductVideoCache updateCuration(Long productId, List<String> pinned, List<String> excluded, Boolean hidden) {
        ProductVideoCache cache = cacheOf(productId);
        if (pinned != null) cache.setPinnedVideoIds(pinned);
        if (excluded != null) cache.setExcludedVideoIds(excluded);
        if (hidden != null) cache.setHidden(hidden);
        return caches.save(cache);
    }
}
