package com.isellastore.youtube;

import com.isellastore.config.StoreProperties;
import com.isellastore.product.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    /** 방문자용: DB만 읽음 */
    @GetMapping("/products/{id}/videos")
    public List<VideoInfo> videos(@PathVariable Long id) {
        if (!props.features().youtubePanel()) return List.of();
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
    @Transactional(readOnly = true)
    public AdminVideoView adminView(@PathVariable Long id) {
        var product = products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var setting = service.settingOf(id);
        var links = service.linksOf(id);
        return new AdminVideoView(
                service.keywordFor(product),
                setting == null ? null : setting.getFetchedAt(),
                links.stream().filter(ProductVideo::isPinned).map(pv -> pv.getVideo().getVideoId()).toList(),
                links.stream().filter(ProductVideo::isExcluded).map(pv -> pv.getVideo().getVideoId()).toList(),
                setting != null && setting.isHidden(),
                links.stream().filter(pv -> pv.getSource() == ProductVideo.Source.SEARCH)
                        .sorted((a, b) -> Integer.compare(a.getRankNo(), b.getRankNo()))
                        .map(pv -> pv.getVideo().toInfo()).toList(),
                service.videosFor(id),
                props.youtube().enabled()
        );
    }

    /** 관리자: 지금 바로 다시 검색 (search.list 1회 소모) */
    @PostMapping("/admin/products/{id}/videos/refresh")
    public List<VideoInfo> refresh(@PathVariable Long id) {
        var product = products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!props.youtube().enabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "YOUTUBE_API_KEY가 설정되지 않았습니다");
        }
        service.refresh(product);
        return service.videosFor(id);
    }

    public record CurationForm(List<String> pinnedVideoIds, List<String> excludedVideoIds, Boolean hidden) {}

    /** 관리자: 영상 고정·제외·패널 숨김 */
    @PutMapping("/admin/products/{id}/videos/curation")
    public List<VideoInfo> curate(@PathVariable Long id, @RequestBody CurationForm form) {
        service.curate(id, form.pinnedVideoIds(), form.excludedVideoIds(), form.hidden());
        return service.videosFor(id);
    }
}
