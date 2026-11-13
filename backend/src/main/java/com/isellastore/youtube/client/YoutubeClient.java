package com.isellastore.youtube.client;

import com.isellastore.global.config.StoreProperties;
import com.isellastore.youtube.dto.VideoInfo;

import com.fasterxml.jackson.databind.JsonNode;
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

    /**
     * 검색 결과 한 페이지. nextPageToken 이 null 이면 마지막 페이지.
     * descriptions: 영상 ID → 설명란 전문 (가격 찾기용, DB에 저장하지 않음)
     */
    public record SearchPage(List<VideoInfo> videos, Map<String, String> descriptions, String nextPageToken) {}

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
        return searchPage(query, maxResults, order, null).videos();
    }

    /** search() 와 같지만 pageToken 으로 다음 페이지를 이어서 받는다. 페이지마다 100 units. */
    public SearchPage searchPage(String query, int maxResults, Order order, String pageToken) {
        return searchPage(query, maxResults, order, pageToken, cfg.regionCode(), cfg.relevanceLanguage());
    }

    /** 지역·언어를 직접 지정 (영미권 유튜버: regionCode=US, relevanceLanguage=en) */
    public SearchPage searchPage(String query, int maxResults, Order order, String pageToken,
                                 String regionCode, String relevanceLanguage) {
        if (!enabled()) {
            log.warn("YOUTUBE_API_KEY가 없어 유튜브 검색을 건너뜁니다: {}", query);
            return new SearchPage(List.of(), Map.of(), null);
        }
        JsonNode res = http.get()
                .uri(b -> b.path("/search")
                        .queryParam("part", "id")
                        .queryParam("type", "video")
                        .queryParam("videoEmbeddable", "true")
                        .queryParam("q", "{q}")
                        .queryParam("maxResults", maxResults)
                        .queryParam("order", order == Order.VIEW_COUNT ? "viewCount" : "relevance")
                        .queryParam("regionCode", regionCode)
                        .queryParam("relevanceLanguage", relevanceLanguage)
                        .queryParam("key", "{key}")
                        .queryParamIfPresent("pageToken", Optional.ofNullable(pageToken))
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
        String next = res == null ? null : res.path("nextPageToken").asText(null);

        // 제목·썸네일·조회수·설명은 videos.list 한 번으로 받고, 순서는 검색 결과 순서를 유지
        Map<String, Detail> details = details(ids);
        List<VideoInfo> videos = new ArrayList<>();
        Map<String, String> descriptions = new HashMap<>();
        for (String id : ids) {
            Detail d = details.get(id);
            if (d == null) continue; // 검색 직후 삭제·비공개된 영상
            videos.add(d.info());
            descriptions.put(id, d.description());
        }
        return new SearchPage(videos, descriptions, next);
    }

    /** 관리자가 고정(핀)한 영상 ID의 제목·썸네일 조회. 1 unit. */
    public List<VideoInfo> videosById(List<String> ids) {
        return details(ids).values().stream().map(Detail::info).toList();
    }

    private record Detail(VideoInfo info, String description) {}

    /** videos.list 1회(1 unit, 최대 50개). 영상 ID → 상세 */
    private Map<String, Detail> details(List<String> ids) {
        Map<String, Detail> out = new LinkedHashMap<>();
        if (!enabled() || ids.isEmpty()) return out;
        JsonNode res = http.get()
                .uri(b -> b.path("/videos")
                        .queryParam("part", "snippet,statistics")
                        .queryParam("id", String.join(",", ids))
                        .queryParam("key", "{key}")
                        .build(cfg.apiKey()))
                .retrieve()
                .body(JsonNode.class);
        if (res == null) return out;
        for (JsonNode item : res.path("items")) {
            JsonNode s = item.path("snippet");
            String id = item.path("id").asText();
            out.put(id, new Detail(
                    new VideoInfo(id, s.path("title").asText(""), s.path("channelTitle").asText(""),
                            thumbnail(s), item.path("statistics").path("viewCount").asLong(0)),
                    s.path("description").asText("")));
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
