package com.isellastore.site;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * DB 연결 확인용. 브라우저에서 http://localhost:8080/api/health/db
 * 접속한 DB 이름·버전과 테이블별 건수를 보여준다. (비밀번호 등은 내보내지 않음)
 */
@RestController
public class DbHealthController {

    private static final List<String> TABLES =
            List.of("category", "product", "product_video_cache", "orders", "order_item");

    private final JdbcTemplate jdbc;

    public DbHealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/health/db")
    public Map<String, Object> db() {
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
