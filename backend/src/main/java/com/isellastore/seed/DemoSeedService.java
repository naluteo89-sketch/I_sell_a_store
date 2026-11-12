package com.isellastore.seed;

import com.isellastore.config.StoreProperties;
import com.isellastore.product.CategoryRepository;
import com.isellastore.product.Product;
import com.isellastore.product.ProductRepository;
import com.isellastore.youtube.ProductVideoService;
import com.isellastore.youtube.VideoInfo;
import com.isellastore.youtube.YoutubeClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * "조회수 높은 유튜브 리뷰를 먼저 찾고, 그 다음 상품을 올린다"
 *
 * 1) 후보마다 "후보명 + 리뷰"를 조회수순으로 검색 (후보 1개 = search.list 1회 = 100 units)
 * 2) 검색된 영상 중 최고 조회수를 그 후보의 점수로 삼음
 * 3) 카테고리별 점수 상위 N개만 상품으로 등록
 * 4) 검색에 쓴 영상 목록을 그대로 상품 영상 캐시에 저장 → 추가 검색 없이 사이드 패널에 바로 표시
 *
 * 기본 후보 24개 = 검색 24회. 하루 기본 한도(100회) 안에서 실행된다.
 */
@Service
public class DemoSeedService {

    public record Ranked(String category, String name, long price, long topViewCount, String topVideoTitle,
                         boolean created) {}

    /** 후보 1개의 검색 결과 (내부 계산용) */
    private record Scored(DemoCandidates.Candidate candidate, String keyword, List<VideoInfo> videos, VideoInfo top) {
        long topViewCount() { return top == null ? 0 : top.viewCount(); }
    }

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
            throw new IllegalStateException("YOUTUBE_API_KEY를 설정해야 데모 상품을 만들 수 있습니다.");
        }
        List<Ranked> report = new ArrayList<>();

        for (var cat : candidates.load()) {
            List<Scored> ranked = cat.candidates().stream()
                    .map(this::score)
                    .sorted(Comparator.comparingLong(Scored::topViewCount).reversed())
                    .toList();

            var category = categories.findBySlug(cat.slug()).orElseThrow();
            for (int i = 0; i < ranked.size(); i++) {
                Scored s = ranked.get(i);
                var cand = s.candidate();
                boolean create = !dryRun && i < perCategory && s.topViewCount() > 0
                        && !products.existsByName(cand.name());
                if (create) {
                    Product p = new Product(cand.name(), cand.description(), cand.price(), 100, category);
                    p.getMetadata().put("demo", true);
                    p.getMetadata().put("topReviewViewCount", s.topViewCount());
                    products.save(p);
                    videoService.store(p.getId(), s.keyword(), s.videos());
                }
                report.add(new Ranked(cat.name(), cand.name(), cand.price(), s.topViewCount(),
                        s.top() == null ? null : s.top().title(), create));
            }
        }
        return report;
    }

    /** 후보명 + 리뷰를 조회수순으로 검색 (search.list 1회) */
    private Scored score(DemoCandidates.Candidate cand) {
        String keyword = videoService.defaultKeyword(cand.name());
        List<VideoInfo> found = youtube.search(keyword, cfg.maxResults(), YoutubeClient.Order.VIEW_COUNT);
        VideoInfo top = found.stream().max(Comparator.comparingLong(VideoInfo::viewCount)).orElse(null);
        return new Scored(cand, keyword, found, top);
    }

    /** 데모 상품 전체 삭제 → 납품 시 고객 상품으로 교체하기 전에 사용 */
    @Transactional
    public int clearDemoProducts() {
        List<Product> demo = products.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getMetadata().get("demo")))
                .toList();
        demo.forEach(p -> p.setActive(false));
        return demo.size();
    }
}
