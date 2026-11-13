package com.isellastore.catalog;

import com.isellastore.global.market.Market;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 리뷰 영상 모아보기 API */
@RestController
@RequestMapping("/api/videos")
public class VideoCollectionController {

    private final VideoCollectionService service;

    public VideoCollectionController(VideoCollectionService service) {
        this.service = service;
    }

    /** 영상 묶음 목록. 전체 개수는 X-Total-Count 헤더 (page 1부터, limit 최대 60) */
    @GetMapping
    public ResponseEntity<List<VideoCollection>> list(@RequestParam(name = "lang", defaultValue = "ko") String lang,
                                                      @RequestParam(name = "category", required = false) String category,
                                                      @RequestParam(name = "minProducts", defaultValue = "2") int minProducts,
                                                      @RequestParam(name = "page", defaultValue = "1") int page,
                                                      @RequestParam(name = "limit", defaultValue = "24") int limit,
                                                      @RequestParam(name = "sort", defaultValue = "views") String sort,
                                                      @RequestParam(name = "q", required = false) String q) {
        CatalogPage<VideoCollection> result = service.page(Market.fromLang(lang), category, minProducts, page, limit, sort, q);
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(result.total()))
                .header("Access-Control-Expose-Headers", "X-Total-Count")
                .body(result.items());
    }

    @GetMapping("/{videoId}")
    public VideoCollection detail(@PathVariable("videoId") String videoId,
                                  @RequestParam(name = "lang", defaultValue = "ko") String lang) {
        return service.detail(Market.fromLang(lang), videoId);
    }
}
