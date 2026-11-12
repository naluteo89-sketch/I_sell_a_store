package com.isellastore.global.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** DB 연결 상태와 테이블별 건수 (비밀번호 등은 내보내지 않음) */
@Service
public class DbHealthService {

    private static final List<String> TABLES = List.of(
            "category", "product", "product_attribute", "product_option", "product_option_value",
            "product_variant", "variant_option_value", "youtube_video", "product_video",
            "product_youtube_setting", "orders", "order_shipping", "order_item", "payment", "admin_user");

    private final JdbcTemplate jdbc;

    public DbHealthService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Object> check() {
        Map<String, Object> out = new LinkedHashMap<>();
        try {
            out.put("status", "UP");
            out.put("database", jdbc.queryForObject("SELECT DATABASE()", String.class));
            out.put("version", jdbc.queryForObject("SELECT VERSION()", String.class));
            Map<String, Object> counts = new LinkedHashMap<>();
            for (String t : TABLES) {
                try {
                    counts.put(t, jdbc.queryForObject("SELECT COUNT(*) FROM " + t, Long.class));
                } catch (Exception e) {
                    counts.put(t, "테이블 없음");
                }
            }
            out.put("tables", counts);
        } catch (Exception e) {
            out.put("status", "DOWN");
            out.put("error", e.getMessage());
        }
        return out;
    }
}
