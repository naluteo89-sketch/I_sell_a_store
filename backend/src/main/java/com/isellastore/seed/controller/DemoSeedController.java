package com.isellastore.seed.controller;

import com.isellastore.seed.service.DemoSeedService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** 관리자 전용 (인증 붙이기 전 운영 서버 공개 금지) */
@RestController
@RequestMapping("/api/admin/seed")
public class DemoSeedController {

    private final DemoSeedService seed;

    public DemoSeedController(DemoSeedService seed) {
        this.seed = seed;
    }

    /**
     * 유튜브 인기 리뷰 기준으로 데모 상품 생성.
     * dryRun=true 면 순위만 보고 등록은 하지 않는다 (검색 할당량은 똑같이 소모됨).
     */
    @PostMapping("/demo")
    public List<DemoSeedService.Ranked> seedDemo(@RequestParam(defaultValue = "4") int perCategory,
                                                 @RequestParam(defaultValue = "false") boolean dryRun) {
        return seed.seed(perCategory, dryRun);
    }

    @DeleteMapping("/demo")
    public Map<String, Integer> clearDemo() {
        return Map.of("deactivated", seed.clearDemoProducts());
    }
}
