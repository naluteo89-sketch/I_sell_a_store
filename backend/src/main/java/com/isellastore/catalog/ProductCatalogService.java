package com.isellastore.catalog;

import com.isellastore.global.market.Market;
import com.isellastore.product.dto.ProductDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 방문자용 상품 목록: 시장·카테고리·검색·정렬·페이지 나눔을 DB 에서 한 번에 처리한다.
 * (예전 방식은 상품 전체를 메모리에 올려 Java 로 걸러서, 1만 개가 넘으면 느려지고 영상 정렬은 지원하지 못했다)
 *
 * 검색어 q: 상품명(한·영) + 대표 영상의 유튜버(채널) 이름
 * 정렬: new · priceAsc · priceDesc · name · videoViews(대표 영상 조회수) · channelViews(유튜버 인기)
 */
@Service
public class ProductCatalogService {

    public static final int MAX_SIZE = 100;

    private final NamedParameterJdbcTemplate jdbc;
    private final ProductLoader loader;

    public ProductCatalogService(NamedParameterJdbcTemplate jdbc, ProductLoader loader) {
        this.jdbc = jdbc;
        this.loader = loader;
    }

    @Transactional(readOnly = true)
    public CatalogPage<ProductCard> list(Market market, String category, String q, String sort, int page, int size) {
        int pageNo = Math.max(1, page);
        int pageSize = CatalogSql.clamp(size, 1, MAX_SIZE);
        boolean byCategory = category != null && !category.isBlank();
        String like = CatalogSql.likeOrNull(q);

        MapSqlParameterSource params = CatalogSql.params(market)
                .addValue("category", byCategory ? category : null)
                .addValue("q", like)
                .addValue("limit", pageSize)
                .addValue("offset", (pageNo - 1) * pageSize);

        String from = " FROM " + CatalogSql.products(byCategory)
                + " LEFT JOIN youtube_video y ON y.video_id = b.vid"
                + " LEFT JOIN " + CatalogSql.CHANNEL_STATS + " ch ON ch.channel_title = y.channel_title"
                + (like == null ? "" : " WHERE (LOWER(b.name) LIKE :q ESCAPE '!' OR LOWER(b.name_en) LIKE :q ESCAPE '!'"
                                     + " OR LOWER(y.channel_title) LIKE :q ESCAPE '!')");

        Long total = jdbc.queryForObject("SELECT COUNT(*)" + from, params, Long.class);
        if (total == null || total == 0) return new CatalogPage<>(List.of(), 0, pageNo, pageSize);

        List<Row> rows = jdbc.query(
                "SELECT b.id, b.vid, y.view_count, y.channel_title" + from + " ORDER BY " + orderBy(sort) + " LIMIT :limit OFFSET :offset",
                params,
                (rs, i) -> new Row(rs.getLong("id"), rs.getString("vid"),
                        (Long) rs.getObject("view_count", Long.class), rs.getString("channel_title")));

        Map<Long, ProductDto> dtos = loader.load(rows.stream().map(Row::id).toList(), market);
        List<ProductCard> items = new ArrayList<>(rows.size());
        for (Row r : rows) {
            ProductDto dto = dtos.get(r.id());
            if (dto != null) items.add(new ProductCard(dto, r.vid(), r.views(), r.channel()));
        }
        return new CatalogPage<>(items, total, pageNo, pageSize);
    }

    /** 정렬 값은 고정된 목록에서만 고른다 (사용자 입력을 SQL 에 그대로 넣지 않음) */
    static String orderBy(String sort) {
        return switch (sort == null ? "new" : sort) {
            case "priceAsc" -> "b.price ASC, b.id DESC";
            case "priceDesc" -> "b.price DESC, b.id DESC";
            case "name" -> "b.sort_name ASC, b.id DESC";
            case "videoViews" -> "y.view_count IS NULL, y.view_count DESC, b.id DESC";
            case "channelViews" -> "ch.channel_views IS NULL, ch.channel_views DESC, y.view_count DESC, b.id DESC";
            default -> "b.created_at DESC, b.id DESC";
        };
    }

    private record Row(long id, String vid, Long views, String channel) {}
}
