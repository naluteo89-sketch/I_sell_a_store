package com.isellastore.catalog;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 1이미지 1상품: 같은 영상에서 수집된 상품들이 썸네일 한 장을 같이 쓰지 않게,
 * 영상의 서로 다른 장면 + 자르는 위치를 상품마다 하나씩 배정한다.
 *
 *   장면 4장: hq720(대표 썸네일), maxres1·2·3(유튜브가 만든 영상 속 장면)
 *   위치 3곳: 가운데 · #crop=left · #crop=right  (가로로 긴 이미지를 정사각형 카드에 다르게 자름)
 *   → 4 × 3 = 12가지. 영상당 상품은 최대 10개라 모두 다른 이미지가 된다.
 *   순서: 처음 4개는 서로 다른 장면의 가운데, 5번째부터 왼쪽·오른쪽 자르기.
 *
 * 고화질 장면이 없는 영상은 프론트(ProductImage)가 보통 화질 장면(hq1·2·3)으로 바꿔 보여 준다.
 * 자동 수집(SourcingWriter)이 새 상품을 대표 썸네일로 넣어도, 서버 시작 시와 10분마다 다시 맞춘다.
 * 수집 상품만 대상이고(sourced_product), 관리자가 직접 넣은 다른 사이트 이미지는 건드리지 않는다.
 */
@Component
public class FrameImageAssigner {

    private static final Logger log = LoggerFactory.getLogger(FrameImageAssigner.class);

    static final String SQL = """
            UPDATE product p
              JOIN (SELECT s.product_id AS id,
                           CONCAT('https://i.ytimg.com/vi/', s.video_id, '/',
                                  ELT(MOD(s.idx, 4) + 1, 'hq720', 'maxres1', 'maxres2', 'maxres3'), '.jpg',
                                  ELT(MOD(FLOOR(s.idx / 4), 3) + 1, '', '#crop=left', '#crop=right')) AS new_url
                      FROM (SELECT product_id, video_id,
                                   ROW_NUMBER() OVER (PARTITION BY video_id ORDER BY product_id) - 1 AS idx
                              FROM sourced_product) s) r ON r.id = p.id
               SET p.image_url = r.new_url
             WHERE (p.image_url IS NULL OR p.image_url LIKE 'https://i.ytimg.com/vi/%')
               AND (p.image_url IS NULL OR p.image_url <> r.new_url)""";

    private final JdbcTemplate jdbc;

    public FrameImageAssigner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        assign();
    }

    /** 스케줄링이 켜져 있으면 10분마다 (새로 수집된 상품 반영) */
    @Scheduled(fixedDelayString = "PT10M", initialDelayString = "PT10M")
    public void periodic() {
        assign();
    }

    public int assign() {
        try {
            int changed = jdbc.update(SQL);
            if (changed > 0) log.info("상품 이미지 장면 배정: {}개 갱신", changed);
            return changed;
        } catch (RuntimeException e) {
            // H2 등 창 함수(ROW_NUMBER)를 지원하지 않는 DB에서는 건너뛴다 — 서비스는 계속 동작
            log.warn("상품 이미지 장면 배정을 건너뜀: {}", e.getMessage());
            return 0;
        }
    }
}
