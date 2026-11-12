package com.isellastore.global.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** DB 연결 확인: http://localhost:8080/api/health/db */
@RestController
public class DbHealthController {

    private final DbHealthService service;

    public DbHealthController(DbHealthService service) {
        this.service = service;
    }

    @GetMapping("/api/health/db")
    public Map<String, Object> db() {
        return service.check();
    }
}
