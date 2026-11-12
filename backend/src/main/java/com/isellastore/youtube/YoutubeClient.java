package com.isellastore.youtube;

import com.fasterxml.jackson.databind.JsonNode;
import com.isellastore.config.StoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;

/**
 * YouTube Data API v3 호출 전담.
 * - search.list : 100 units, 기본 하루 100회 → 반드시 캐시와 함께 사용
 * - videos.list : 1 unit, 조회수 확인용
 * API 키는 서버에만 두고 브라우저로 내보내지 않는다.
 */
@Component
public class YoutubeClient {

    private static final Logger log = LoggerFactory.getLogger(YoutubeClient.class);
    private static final String BASE = "https://www.googleapis.com/youtube/v3";

    public enum Order { RELEVANCE, VIEW_COUNT }

    private final StoreProperties.Youtube cfg;
    private final RestClient http = RestClient.create(BASE);

    public YoutubeClient(StoreProperties props) {
        this.cfg = props.youtube();
    }

    public boolean enabled() {
        return cfg.enabled();
    }

    /** 검색 + 상세(조회수 포함) 보강. 검색 1회(100 units) + 상세 1회(1 unit). */
    public List<VideoInfo> search(String query, int maxResults, Order order) {
        if (!enabled()) {
            log.warn("YOUTUBE_API_KEY가 없어 유튜브 검색을 건너뜁니다: {}", query);
            return List.of();
        }
        JsonNode res = http.get()
                .uri(b -> b.path("/search")
                        .queryParam("part", "id")
                        .queryParam("type", "video")
                        .queryParam("videoEmbeddable", "true")
                        .queryParam("q", "{q}")
                        .queryParam("maxResults", maxResults)
                        .queryParam("order", order == Order.VIEW_COUNT ? "viewCount" : "relevance")
                        .queryParam("regionCode", cfg.regionCode())
                        .queryParam("relevanceLanguage", cfg.relevanceLanguage())
                        .queryParam("key", "{key}")
                        // 한글·특수문자 검색어가 안전하게 인코딩되도록 변수로 넘김
                        .build(query, cfg.apiKey()))
                .retrieve()
                .body(JsonNode.class);

        List<String> ids = new ArrayList<>();
        if (res != null) {
            for (JsonNode item : res.path("items")) {
                String id = item.path("id").path("videoId").asText(null);
                if (id != null) ids.add(id);
            }
        }
        if (ids.isEmpty()) return List.of();

        // 제목·썸네일·조회수는 videos.list 한 번으로 받고, 순서는 검색 결과 순서를 유지
        Map<String, VideoInfo> byId = new HashMap<>();
        for (VideoInfo v : videosById(ids)) byId.put(v.videoId(), v);
        return ids.stream().map(byId::get).filter(Objects::nonNull).toList();
    }

    /** 영상 ID로 제목·채널·썸네일·조회수 조회. 1 unit. */
    public List<VideoInfo> videosById(List<String> ids) {
        if (!enabled() || ids.isEmpty()) return List.of();
        JsonNode res = http.get()
                .uri(b -> b.path("/videos")
                        .queryParam("part", "snippet,statistics")
                        .queryParam("id", String.join(",", ids))
                        .queryParam("key", "{key}")
                        .build(cfg.apiKey()))
                .retrieve()
                .body(JsonNode.class);
        List<VideoInfo> out = new ArrayList<>();
        if (res != null) {
            for (JsonNode item : res.path("items")) {
                JsonNode s = item.path("snippet");
                out.add(new VideoInfo(
                        item.path("id").asText(),
                        s.path("title").asText(""),
                        s.path("channelTitle").asText(""),
                        thumbnail(s),
                        item.path("statistics").path("viewCount").asLong(0)
                ));
            }
        }
        return out;
    }

    private static String thumbnail(JsonNode snippet) {
        JsonNode t = snippet.path("thumbnails");
        for (String size : List.of("high", "medium", "default")) {
            String url = t.path(size).path("url").asText(null);
            if (url != null) return url;
        }
        return null;
    }
}
