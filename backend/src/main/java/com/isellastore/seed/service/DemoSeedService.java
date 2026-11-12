package com.isellastore.seed.service;

import com.isellastore.global.config.StoreProperties;
import com.isellastore.global.error.ApiException;
import com.isellastore.product.domain.Product;
import com.isellastore.product.repository.CategoryRepository;
import com.isellastore.product.repository.ProductRepository;
import com.isellastore.youtube.client.YoutubeClient;
import com.isellastore.youtube.dto.VideoInfo;
import com.isellastore.youtube.service.ProductVideoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * "조회수 높은 유튜브 리뷰를 먼저 찾고, 그 다음 상품을 올린다"
 *
 * 1) 후보마다 "후보명 + 리뷰"를 조회수순으로 검색 (후보 1개 = search.list 1회 = 100 units)
 * 2) 검색된 영상 중 최고 조회수를 그 후보의 점수로 삼음
 * 3) 카테고리별 점수 상위 N개만 상품으로 등록 (demo = true)
 * 4) 검색에 쓴 영상 목록을 그대로 상품 영상으로 저장 → 추가 검색 없이 사이드 패널에 바로 표시
 *
 * 기본 후보 24개 = 검색 24회. 하루 기본 한도(100회) 안에서 실행된다.
 */
@Service
public class DemoSeedService {

    public record Ranked(String category, String name, long price, long topViewCount, String topVideoTitle,
                         boolean created) {}

    private record Scored(DemoCandidates.Candidate candidate, long topViews, String topTitle, List<VideoInfo> videos) {}

    private final DemoCandidates candidates;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ProductVideoService videoService;
    private final YoutubeClient youtube;
    private final StoreProperties.Youtube cfg;

    public DemoSeedService(DemoCandidates candidates, CategoryRepository categories, ProductRepository products,
                           ProductVideoService videoService, YoutubeClient youtube, StoreProperties props) {
        this.candidates = candidates;
        this.categories = categories;
        this.products = products;
        this.videoService = videoService;
        this.youtube = youtube;
        this.cfg = props.youtube();
    }

    @Transactional
    public List<Ranked> seed(int perCategory, boolean dryRun) {
        if (!youtube.enabled()) {
            throw ApiException.badRequest("YOUTUBE_API_KEY를 설정해야 데모 상품을 만들 수 있습니다.");
        }
        List<Ranked> report = new ArrayList<>();

        for (var cat : candidates.load()) {
            List<Scored> scored = new ArrayList<>();
            for (var cand : cat.candidates()) {
                List<VideoInfo> found = youtube.search(cand.name() + cfg.keywordSuffix(), cfg.maxResults(),
                        YoutubeClient.Order.VIEW_COUNT);
                VideoInfo top = found.stream().max(Comparator.comparingLong(VideoInfo::viewCount)).orElse(null);
                scored.add(new Scored(cand, top == null ? 0 : top.viewCount(), top == null ? null : top.title(), found));
            }
            scored.sort(Comparator.comparingLong(Scored::topViews).reversed());

            var category = categories.findBySlug(cat.slug()).orElseThrow();
            for (int i = 0; i < scored.size(); i++) {
                Scored s = scored.get(i);
                boolean pick = i < perCategory && s.topViews() > 0 && !products.existsByName(s.candidate().name());
                if (pick && !dryRun) {
                    var c = s.candidate();
                    Product p = new Product(c.name(), c.description(), c.price(), 100, category);
                    p.setDemo(true);
                    products.save(p);
                    videoService.store(p, s.videos());
                }
                report.add(new Ranked(cat.name(), s.candidate().name(), s.candidate().price(),
                        s.topViews(), s.topTitle(), pick && !dryRun));
            }
        }
        return report;
    }

    /** 데모 상품 판매중지 → 납품 시 고객 상품으로 교체하기 전에 사용 */
    @Transactional
    public int clearDemoProducts() {
        List<Product> demo = products.findByDemoTrue();
        demo.forEach(p -> p.setActive(false));
        return demo.size();
    }
}
