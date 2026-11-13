package com.isellastore.sourcing.service;

import com.isellastore.global.error.ApiException;
import com.isellastore.global.market.Market;
import com.isellastore.seed.service.DemoCandidates;
import com.isellastore.sourcing.dto.SourcingStatus;
import com.isellastore.youtube.client.YoutubeClient;
import com.isellastore.youtube.dto.VideoInfo;

import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 유튜브 소개 제품 수집 (백그라운드 작업 1개). 외부 API는 유튜브만 사용.
 *
 * 1) 카테고리별 검색어로 유튜브를 페이지마다 이어서 검색 (페이지 1개 = 100 units)
 *    - 한국 유튜버(KR): "패션 추천템", "디지털 리뷰" … (regionCode=KR, relevanceLanguage=ko) → 한국 시장 상품
 *    - 영미권 유튜버(US): "fashion haul", "tech review" … (regionCode=US, relevanceLanguage=en) → 영미권 시장 상품
 *      설명란 달러 가격은 원화로 환산 후 같은 가격 규칙
 * 2) 영상 설명란에서 제품 목록을 뽑는다 (가격 있는 줄, 또는 바로 다음 줄이 링크인 줄) → SourcingRules.productsFrom
 * 3) 가격 = 설명란 금액 + 가격 규칙(SourcingRules.salePrice). 링크만 있으면 테스트 가격 7701원
 * 4) 사진 = 영상 썸네일. 데모 상품으로 등록하고 영상은 상품 패널에 연결
 * 설명란에 제품 목록이 없는 영상은 건너뛴다 (제목만으로는 제품명을 알 수 없음)
 *
 * 멈추는 때: 관리자 stop 요청 · 유튜브 하루 할당량 소진(403 quotaExceeded) · maxSearches 도달 · 검색 결과 끝
 * ⚠️ 할당량을 다 쓰면 그날은 영상 자동 갱신(VideoRefreshScheduler)·관리자 재검색도 안 된다. (매일 17시 KST 초기화)
 */
@Service
public class SourcingJob {

    private static final Logger log = LoggerFactory.getLogger(SourcingJob.class);

    /** 한국 유튜버: 카테고리 이름 뒤에 붙여 검색어를 만든다 */
    private static final List<String> QUERY_SUFFIXES_KO = List.of(
            " 추천템", " 리뷰", " 언박싱", " 내돈내산", " 하울",
            " 구매템", " 쇼핑 하울", " 꿀템 추천", " 신상 리뷰", " 가격 정보");
    /** 영미권 유튜버: 카테고리(slug) → 영어 검색 단어 */
    private static final Map<String, String> CATEGORY_EN = Map.of(
            "fashion", "fashion", "goods", "accessories", "living", "home", "digital", "tech");
    private static final List<String> QUERY_SUFFIXES_EN = List.of(
            " haul", " review", " unboxing", " must haves", " favorites",
            " try on haul", " amazon finds", " best products", " buying guide", " under $50");
    /** search.list 비용은 결과 수와 무관 → 한 번에 최대치(50)로 받는다 */
    private static final int VIDEOS_PER_SEARCH = 50;
    /** 너무 빨리 부르면 429(요청 과다) → 검색 사이 쉬는 시간, 429 때 기다리는 시간·재시도 횟수 */
    private static final long PAUSE_BETWEEN_SEARCHES_MS = 1_500;
    private static final long RATE_LIMIT_WAIT_MS = 60_000;
    private static final int RATE_LIMIT_RETRIES = 5;

    private record Query(Market market, String categorySlug, String text) {}

    private final YoutubeClient youtube;
    private final DemoCandidates candidates;
    private final SourcingWriter writer;
    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "sourcing-job");
        t.setDaemon(true);
        return t;
    });

    // 상태 (작업 스레드가 쓰고, 상태 API가 읽음)
    private volatile boolean running;
    private volatile boolean stopRequested;
    private volatile Instant startedAt;
    private volatile Instant finishedAt;
    private volatile String currentQuery;
    private volatile String stopReason;
    private volatile int searches;
    private volatile int videosChecked;
    private volatile int created;
    private volatile int pricedFromDescription;
    private volatile int skipped;

    public SourcingJob(YoutubeClient youtube, DemoCandidates candidates, SourcingWriter writer) {
        this.youtube = youtube;
        this.candidates = candidates;
        this.writer = writer;
    }

    /**
     * @param maxSearches   유튜브 검색 횟수 상한 (null = 할당량이 끝날 때까지)
     * @param fromBeginning true 면 저장된 진행 위치를 지우고 첫 페이지부터
     * @param markets       수집할 시장 (KR = 한국 유튜버, US = 영미권 유튜버). 비어 있으면 둘 다 번갈아
     */
    public synchronized SourcingStatus start(Integer maxSearches, boolean fromBeginning, List<Market> markets) {
        if (!youtube.enabled()) throw ApiException.badRequest("YOUTUBE_API_KEY가 설정되지 않았습니다");
        if (running) throw ApiException.conflict("이미 수집 중입니다");

        running = true;
        stopRequested = false;
        startedAt = Instant.now();
        finishedAt = null;
        stopReason = null;
        currentQuery = null;
        searches = videosChecked = created = pricedFromDescription = skipped = 0;
        int limit = maxSearches == null || maxSearches <= 0 ? Integer.MAX_VALUE : maxSearches;
        if (fromBeginning) writer.resetCursors();
        List<Market> targets = markets == null || markets.isEmpty() ? List.of(Market.values()) : List.copyOf(markets);
        executor.submit(() -> run(limit, targets));
        return status();
    }

    public SourcingStatus stop() {
        if (running) stopRequested = true;
        return status();
    }

    public SourcingStatus status() {
        return new SourcingStatus(running, stopRequested, startedAt, finishedAt, currentQuery,
                searches, videosChecked, created, pricedFromDescription, skipped, stopReason);
    }

    // ───────── 작업 본체 ─────────

    private void run(int maxSearches, List<Market> markets) {
        String reason = "검색 결과를 모두 확인했습니다";
        try {
            List<Query> queries = queries(markets);
            // 지난번에 멈춘 페이지부터 이어서 (DB에 저장된 위치)
            List<String> pageTokens = new ArrayList<>();
            List<Boolean> exhausted = new ArrayList<>();
            for (Query q : queries) {
                var c = writer.cursor(q.text());
                pageTokens.add(c.getPageToken());
                exhausted.add(c.isExhausted());
            }
            Set<String> seenVideos = new HashSet<>();

            // 검색어를 돌아가며 한 페이지씩 → 카테고리가 고르게 채워진다
            outer:
            while (exhausted.contains(false)) {
                for (int i = 0; i < queries.size(); i++) {
                    if (exhausted.get(i)) continue;
                    if (stopRequested) { reason = "관리자가 중단했습니다"; break outer; }
                    if (searches >= maxSearches) { reason = "검색 횟수 상한(" + maxSearches + "회)에 도달했습니다"; break outer; }

                    Query q = queries.get(i);
                    currentQuery = q.text();
                    YoutubeClient.SearchPage page = searchWithRetry(q, pageTokens.get(i));
                    if (page == null) { reason = "관리자가 중단했습니다"; break outer; }
                    searches++;
                    pageTokens.set(i, page.nextPageToken());
                    if (page.nextPageToken() == null) exhausted.set(i, true);
                    writer.advance(q.text(), page.nextPageToken());

                    for (VideoInfo v : page.videos()) {
                        if (stopRequested) { reason = "관리자가 중단했습니다"; break outer; }
                        if (!seenVideos.add(v.videoId()) || writer.alreadyCollected(v.videoId())) continue;
                        videosChecked++;
                        process(q, v, page.descriptions().get(v.videoId()));
                    }
                }
            }
        } catch (HttpClientErrorException e) {
            reason = isQuotaExceeded(e)
                    ? "유튜브 하루 할당량을 모두 사용했습니다 (17시 KST 초기화)"
                    : "외부 API 오류로 중단: " + e.getStatusCode() + " " + e.getStatusText();
            log.warn("상품 수집 중단: {}", reason);
        } catch (Exception e) {
            reason = "오류로 중단: " + e.getMessage();
            log.error("상품 수집 오류", e);
        } finally {
            stopReason = reason;
            currentQuery = null;
            finishedAt = Instant.now();
            running = false;
            log.info("상품 수집 종료 — 검색 {}회, 영상 {}개 확인, 등록 {}건(설명란 가격 {}건), 건너뜀 {}건 ({})",
                    searches, videosChecked, created, pricedFromDescription, skipped, reason);
        }
    }

    /** 429(요청 과다)면 1분 쉬고 다시 (최대 5번). 쉬는 동안 중단 요청이 오면 null */
    private YoutubeClient.SearchPage searchWithRetry(Query q, String pageToken) throws InterruptedException {
        for (int attempt = 0; ; attempt++) {
            if (!pause(PAUSE_BETWEEN_SEARCHES_MS)) return null;
            try {
                return youtube.searchPage(q.text(), VIDEOS_PER_SEARCH, YoutubeClient.Order.RELEVANCE, pageToken,
                        q.market().regionCode(), q.market().relevanceLanguage());
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() != 429 || attempt >= RATE_LIMIT_RETRIES) throw e;
                log.info("유튜브 요청 과다(429) — {}초 쉬고 다시 시도 ({}/{})",
                        RATE_LIMIT_WAIT_MS / 1000, attempt + 1, RATE_LIMIT_RETRIES);
                if (!pause(RATE_LIMIT_WAIT_MS)) return null;
            }
        }
    }

    /** 쉬는 중에도 중단 요청을 바로 반영. 중단되면 false */
    private boolean pause(long ms) throws InterruptedException {
        for (long waited = 0; waited < ms; waited += 200) {
            if (stopRequested) return false;
            Thread.sleep(200);
        }
        return !stopRequested;
    }

    /** 영상 1개 → 설명란에 소개된 제품들 등록 시도 */
    private void process(Query q, VideoInfo video, String description) {
        List<SourcingRules.Found> found = SourcingRules.productsFrom(description, q.market());
        if (found.isEmpty()) { skipped++; return; }
        for (SourcingRules.Found f : found) {
            try {
                if (writer.register(q.market(), q.categorySlug(), f.name(), video, f.price())) {
                    created++;
                    if (f.price() != null) pricedFromDescription++;
                }
            } catch (DataAccessException e) {
                // 저장 실패는 이 건만 건너뛴다 (작업은 계속)
                log.warn("상품 저장 실패, 건너뜀 ({}): {}", f.name(), e.getMessage());
            }
        }
    }

    /**
     * 카테고리를 번갈아 가며 (패션 추천템 → 잡화 추천템 → … → 패션 리뷰 → …),
     * 시장이 둘이면 한국·영미권 검색어도 번갈아 (패션 추천템 → fashion haul → 잡화 추천템 → …)
     */
    private List<Query> queries(List<Market> markets) {
        var cats = candidates.load();
        List<List<Query>> perMarket = new ArrayList<>();
        for (Market m : markets) {
            List<Query> qs = new ArrayList<>();
            List<String> suffixes = m == Market.US ? QUERY_SUFFIXES_EN : QUERY_SUFFIXES_KO;
            for (String suffix : suffixes) {
                for (var cat : cats) {
                    String word = m == Market.US ? CATEGORY_EN.getOrDefault(cat.slug(), cat.slug()) : cat.name();
                    qs.add(new Query(m, cat.slug(), word + suffix));
                }
            }
            perMarket.add(qs);
        }
        List<Query> out = new ArrayList<>();
        int longest = perMarket.stream().mapToInt(List::size).max().orElse(0);
        for (int i = 0; i < longest; i++) {
            for (List<Query> qs : perMarket) if (i < qs.size()) out.add(qs.get(i));
        }
        return out;
    }

    /** 403 quotaExceeded, 또는 재시도 후에도 계속되는 429 (search.list 한도 소진 때 이렇게 옴) */
    private static boolean isQuotaExceeded(HttpClientErrorException e) {
        String body = e.getResponseBodyAsString();
        int status = e.getStatusCode().value();
        return status == 429
                || (status == 403 && (body.contains("quotaExceeded") || body.contains("dailyLimitExceeded")));
    }

    @PreDestroy
    void shutdown() {
        stopRequested = true;
        executor.shutdownNow();
    }
}
