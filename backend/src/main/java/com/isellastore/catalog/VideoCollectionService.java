package com.isellastore.catalog;

import com.isellastore.global.error.ApiException;
import com.isellastore.global.market.Market;
import com.isellastore.product.dto.ProductDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 리뷰 영상별 상품 모아보기 (규격: frontend/docs/market-api.md)
 * 한 영상에서 상품이 여러 개 나오면 목록이 도배되므로, 영상 단위로 묶어서 보여준다.
 */
@Service
public class VideoCollectionService {

    static final int PREVIEW = 4;
    static final int MAX_LIMIT = 60;

    private final NamedParameterJdbcTemplate jdbc;
    private final ProductLoader loader;

    public VideoCollectionService(NamedParameterJdbcTemplate jdbc, ProductLoader loader) {
        this.jdbc = jdbc;
        this.loader = loader;
    }

    /**
     * @param minProducts 이 수 이상 상품이 연결된 영상만
     * @param sort views(영상 조회수, 기본) · channelViews(유튜버 인기) · new(최근 상품이 붙은 영상)
     * @param q 영상 제목 + 유튜버 이름
     */
    @Transactional(readOnly = true)
    public List<VideoCollection> list(Market market, int minProducts, int limit, String sort, String q) {
        String like = CatalogSql.likeOrNull(q);
        MapSqlParameterSource params = CatalogSql.params(market)
                .addValue("min", Math.max(1, minProducts))
                .addValue("limit", CatalogSql.clamp(limit, 1, MAX_LIMIT))
                .addValue("q", like);

        String sql = """
                SELECT y.video_id, y.title, y.channel_title, y.thumbnail_url, y.view_count,
                       COALESCE(MAX(ch.channel_views), 0) AS channel_views,
                       COUNT(*) AS product_count, MAX(b.created_at) AS latest
                  FROM %s
                  JOIN youtube_video y ON y.video_id = b.vid
                  LEFT JOIN %s ch ON ch.channel_title = y.channel_title
                 %s
                 GROUP BY y.video_id, y.title, y.channel_title, y.thumbnail_url, y.view_count
                HAVING COUNT(*) >= :min
                 ORDER BY %s
                 LIMIT :limit""".formatted(
                CatalogSql.products(false), CatalogSql.CHANNEL_STATS,
                like == null ? "" : "WHERE (LOWER(y.title) LIKE :q ESCAPE '!' OR LOWER(y.channel_title) LIKE :q ESCAPE '!')",
                orderBy(sort));

        List<VideoSummary> videos = jdbc.query(sql, params, (rs, i) -> new VideoSummary(
                rs.getString("video_id"), rs.getString("title"), rs.getString("channel_title"),
                rs.getString("thumbnail_url"), rs.getLong("view_count"), rs.getLong("channel_views"),
                rs.getInt("product_count")));
        if (videos.isEmpty()) return List.of();

        Map<String, List<Long>> idsByVideo = productIds(market, videos.stream().map(VideoSummary::videoId).toList(), PREVIEW);
        return assemble(videos, idsByVideo, market);
    }

    /** 영상 하나의 상품 전부. 이 시장에 노출되는 상품이 없으면 404 */
    @Transactional(readOnly = true)
    public VideoCollection detail(Market market, String videoId) {
        MapSqlParameterSource params = CatalogSql.params(market).addValue("vid", videoId);
        List<VideoSummary> found = jdbc.query("""
                SELECT y.video_id, y.title, y.channel_title, y.thumbnail_url, y.view_count,
                       COALESCE((SELECT SUM(z.view_count) FROM youtube_video z WHERE z.channel_title = y.channel_title), 0) AS channel_views
                  FROM youtube_video y WHERE y.video_id = :vid""", params, (rs, i) -> new VideoSummary(
                rs.getString("video_id"), rs.getString("title"), rs.getString("channel_title"),
                rs.getString("thumbnail_url"), rs.getLong("view_count"), rs.getLong("channel_views"), 0));
        if (found.isEmpty()) throw ApiException.notFound("영상을 찾을 수 없습니다");

        Map<String, List<Long>> ids = productIds(market, List.of(videoId), Integer.MAX_VALUE);
        List<Long> productIds = ids.getOrDefault(videoId, List.of());
        if (productIds.isEmpty()) throw ApiException.notFound("이 영상에 연결된 상품이 없습니다");

        VideoSummary v = found.get(0);
        VideoSummary withCount = new VideoSummary(v.videoId(), v.title(), v.channelTitle(), v.thumbnailUrl(),
                v.viewCount(), v.channelViewCount(), productIds.size());
        return assemble(List.of(withCount), ids, market).get(0);
    }

    /** 영상별 상품 id (최신순, 영상마다 최대 perVideo 개) */
    private Map<String, List<Long>> productIds(Market market, List<String> videoIds, int perVideo) {
        MapSqlParameterSource params = CatalogSql.params(market).addValue("vids", videoIds);
        Map<String, List<Long>> out = new LinkedHashMap<>();
        jdbc.query("SELECT b.vid, b.id FROM " + CatalogSql.products(false)
                        + " WHERE b.vid IN (:vids) ORDER BY b.created_at DESC, b.id DESC",
                params, rs -> {
                    List<Long> list = out.computeIfAbsent(rs.getString("vid"), k -> new ArrayList<>());
                    if (list.size() < perVideo) list.add(rs.getLong("id"));
                });
        return out;
    }

    private List<VideoCollection> assemble(List<VideoSummary> videos, Map<String, List<Long>> idsByVideo, Market market) {
        List<Long> all = idsByVideo.values().stream().flatMap(List::stream).toList();
        Map<Long, ProductDto> dtos = loader.load(all, market);
        List<VideoCollection> out = new ArrayList<>(videos.size());
        for (VideoSummary v : videos) {
            List<ProductCard> cards = new ArrayList<>();
            for (Long id : idsByVideo.getOrDefault(v.videoId(), List.of())) {
                ProductDto dto = dtos.get(id);
                if (dto != null) cards.add(new ProductCard(dto, v.videoId(), v.viewCount(), v.channelTitle()));
            }
            out.add(new VideoCollection(v, v.productCount(), cards));
        }
        return out;
    }

    static String orderBy(String sort) {
        return switch (sort == null ? "views" : sort) {
            case "channelViews" -> "channel_views DESC, y.view_count DESC";
            case "new" -> "latest DESC";
            default -> "y.view_count DESC";
        };
    }
}
