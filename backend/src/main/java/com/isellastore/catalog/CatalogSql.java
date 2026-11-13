package com.isellastore.catalog;

import com.isellastore.global.market.Market;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;

import java.util.Locale;

/**
 * 상품 목록·영상 모아보기가 함께 쓰는 SQL 조각.
 *
 * 대표 영상(primary video) = 자동 수집 상품이면 그 출처 영상(sourced_product.video_id),
 * 직접 등록 상품이면 연결 영상 중 고정(pinned) → 순위(rank_no) 1번.
 *
 * 유튜버 인기 = 그 채널이 우리 카탈로그에 올린 영상들의 조회수 합계.
 * (youtube_video 에 채널 ID·구독자 수가 없어 채널 이름으로 묶는다. 채널 통계를 저장하게 되면 그 값으로 바꾼다)
 */
final class CatalogSql {

    private CatalogSql() {}

    static final String PRIMARY_VIDEO = """
            COALESCE(
              (SELECT s.video_id FROM sourced_product s WHERE s.product_id = p.id ORDER BY s.id LIMIT 1),
              (SELECT x.video_id FROM product_video x WHERE x.product_id = p.id AND x.excluded = 0
                ORDER BY x.pinned DESC, x.rank_no LIMIT 1))""";

    static final String CHANNEL_STATS =
            "(SELECT channel_title, SUM(view_count) AS channel_views FROM youtube_video GROUP BY channel_title)";

    /** 이 시장에 노출되는 판매중 상품 + 대표 영상 ID. 별칭 b */
    static String products(boolean byCategory) {
        return """
                (SELECT p.id, p.created_at, p.price, p.name, p.name_en,
                        CASE WHEN :us = 1 AND p.name_en IS NOT NULL AND p.name_en <> '' THEN p.name_en ELSE p.name END AS sort_name,
                        %s AS vid
                   FROM product p LEFT JOIN category c ON c.id = p.category_id
                  WHERE p.active = 1
                    AND CONCAT(',', REPLACE(p.markets, ' ', ''), ',') LIKE :market
                    %s) b""".formatted(PRIMARY_VIDEO, byCategory ? "AND c.slug = :category" : "");
    }

    static MapSqlParameterSource params(Market market) {
        return new MapSqlParameterSource()
                .addValue("market", "%," + market.name() + ",%")
                .addValue("us", market == Market.US ? 1 : 0);
    }

    /** LIKE 검색어: 소문자 + 와일드카드(% _) 이스케이프. 비었으면 null */
    static String likeOrNull(String q) {
        if (q == null || q.isBlank()) return null;
        String s = q.trim().toLowerCase(Locale.ROOT).replace("!", "!!").replace("%", "!%").replace("_", "!_");
        return "%" + s + "%";
    }

    static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
