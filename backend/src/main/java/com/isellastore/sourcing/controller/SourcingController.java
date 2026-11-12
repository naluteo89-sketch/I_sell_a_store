package com.isellastore.sourcing.controller;

import com.isellastore.sourcing.dto.AdminSourcedItemDto;
import com.isellastore.sourcing.dto.SourcedItemDto;
import com.isellastore.sourcing.dto.SourcingStatus;
import com.isellastore.sourcing.service.SourcedProductQueryService;
import com.isellastore.sourcing.service.SourcingJob;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 유튜브 소개 제품 수집 API (요청 → 서비스 호출 → 응답만 담당) */
@RestController
@RequestMapping("/api")
public class SourcingController {

    private final SourcingJob job;
    private final SourcedProductQueryService query;

    public SourcingController(SourcingJob job, SourcedProductQueryService query) {
        this.job = job;
        this.query = query;
    }

    /** 프론트용: 사진 + 정보 목록 (판매 중인 것만) */
    @GetMapping("/sourced-products")
    public List<SourcedItemDto> list() {
        return query.forStore();
    }

    // ───────── 관리자 (인증 붙이기 전 운영 서버 공개 금지) ─────────

    @GetMapping("/admin/sourcing/items")
    public List<AdminSourcedItemDto> adminList() {
        return query.forAdmin();
    }

    /**
     * 수집 시작. maxSearches 없으면 유튜브 하루 할당량이 끝날 때까지.
     * 지난번에 멈춘 페이지부터 이어서 한다 (fromBeginning=true 면 처음부터)
     */
    @PostMapping("/admin/sourcing/start")
    public SourcingStatus start(@RequestParam(required = false) Integer maxSearches,
                                @RequestParam(defaultValue = "false") boolean fromBeginning) {
        return job.start(maxSearches, fromBeginning);
    }

    /** 수집 중단 (진행 중인 영상 1개 처리 후 멈춤, 이미 등록한 상품은 유지) */
    @PostMapping("/admin/sourcing/stop")
    public SourcingStatus stop() {
        return job.stop();
    }

    @GetMapping("/admin/sourcing/status")
    public SourcingStatus status() {
        return job.status();
    }
}
