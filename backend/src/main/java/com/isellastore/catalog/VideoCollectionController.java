package com.isellastore.catalog;

import com.isellastore.global.market.Market;
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

    @GetMapping
    public List<VideoCollection> list(@RequestParam(name = "lang", defaultValue = "ko") String lang,
                                      @RequestParam(name = "minProducts", defaultValue = "2") int minProducts,
                                      @RequestParam(name = "limit", defaultValue = "24") int limit,
                                      @RequestParam(name = "sort", defaultValue = "views") String sort,
                                      @RequestParam(name = "q", required = false) String q) {
        return service.list(Market.fromLang(lang), minProducts, limit, sort, q);
    }

    @GetMapping("/{videoId}")
    public VideoCollection detail(@PathVariable("videoId") String videoId,
                                  @RequestParam(name = "lang", defaultValue = "ko") String lang) {
        return service.detail(Market.fromLang(lang), videoId);
    }
}
