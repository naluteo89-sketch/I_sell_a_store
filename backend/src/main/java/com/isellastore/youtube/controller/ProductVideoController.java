package com.isellastore.youtube.controller;

import com.isellastore.global.config.StoreProperties;
import com.isellastore.youtube.dto.AdminVideoView;
import com.isellastore.youtube.dto.CurationForm;
import com.isellastore.youtube.dto.VideoInfo;
import com.isellastore.youtube.service.ProductVideoService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 상품 유튜브 영상 API (요청 → 서비스 호출 → 응답만 담당) */
@RestController
@RequestMapping("/api")
public class ProductVideoController {

    private final ProductVideoService service;
    private final StoreProperties props;

    public ProductVideoController(ProductVideoService service, StoreProperties props) {
        this.service = service;
        this.props = props;
    }

    /** 방문자용: DB만 읽음 (유튜브 검색 할당량 사용 안 함) */
    @GetMapping("/products/{id}/videos")
    public List<VideoInfo> videos(@PathVariable Long id) {
        return props.features().youtubePanel() ? service.videosFor(id) : List.of();
    }

    @GetMapping("/admin/products/{id}/videos")
    public AdminVideoView adminView(@PathVariable Long id) {
        return service.adminView(id);
    }

    /** 관리자: 지금 바로 다시 검색 (search.list 1회 소모) */
    @PostMapping("/admin/products/{id}/videos/refresh")
    public List<VideoInfo> refresh(@PathVariable Long id) {
        return service.refreshNow(id);
    }

    @PutMapping("/admin/products/{id}/videos/curation")
    public List<VideoInfo> curate(@PathVariable Long id, @RequestBody CurationForm form) {
        service.curate(id, form.pinnedVideoIds(), form.excludedVideoIds(), form.hidden());
        return service.videosFor(id);
    }
}
