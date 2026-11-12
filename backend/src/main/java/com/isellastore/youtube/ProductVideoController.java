package com.isellastore.youtube;

import com.isellastore.config.StoreProperties;
import com.isellastore.product.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductVideoController {

    private final ProductVideoService service;
    private final ProductRepository products;
    private final StoreProperties props;

    public ProductVideoController(ProductVideoService service, ProductRepository products, StoreProperties props) {
        this.service = service;
        this.products = products;
        this.props = props;
    }

    /** 방문자용: 캐시만 반환 */
    @GetMapping("/products/{id}/videos")
    public List<VideoInfo> videos(@PathVariable Long id) {
        if (!props.features().youtubePanel()) return List.of();
        return service.videosFor(id);
    }

    /** 관리자: 지금 바로 다시 검색 (search.list 1회 소모) */
    @PostMapping("/admin/products/{id}/videos/refresh")
    public List<VideoInfo> refresh(@PathVariable Long id) {
        service.refresh(products.getOrNotFound(id));
        return service.videosFor(id);
    }

    /** 관리자 화면용: 검색 원본 + 고정·제외 상태 + 실제 노출 목록 */
    public record AdminVideoView(
            String keyword,
            Instant fetchedAt,
            List<String> pinnedVideoIds,
            List<String> excludedVideoIds,
            boolean hidden,
            List<VideoInfo> searchResults,
            List<VideoInfo> displayed,
            boolean apiKeyConfigured
    ) {}

    @GetMapping("/admin/products/{id}/videos")
    public AdminVideoView adminView(@PathVariable Long id) {
        var product = products.getOrNotFound(id);
        var cache = service.cacheOf(id);
        return new AdminVideoView(
                cache.getKeyword() != null ? cache.getKeyword() : service.keywordFor(product),
                cache.getFetchedAt(),
                cache.getPinnedVideoIds(),
                cache.getExcludedVideoIds(),
                cache.isHidden(),
                cache.getVideos(),
                service.videosFor(id),
                props.youtube().enabled()
        );
    }

    public record CurationForm(List<String> pinnedVideoIds, List<String> excludedVideoIds, Boolean hidden) {}

    /** 관리자: 영상 고정·제외·패널 숨김 */
    @PutMapping("/admin/products/{id}/videos/curation")
    public List<VideoInfo> curate(@PathVariable Long id, @RequestBody CurationForm form) {
        service.updateCuration(id, form.pinnedVideoIds(), form.excludedVideoIds(), form.hidden());
        return service.videosFor(id);
    }
}
