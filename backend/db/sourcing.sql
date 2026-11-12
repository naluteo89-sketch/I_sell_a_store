-- 기존 my_db 에 '상품 수집' 테이블 2개만 추가 (다른 테이블·데이터는 건드리지 않음)
-- 실행: MySQL Workbench에서 이 파일 열기 → 번개 아이콘
-- (schema.sql 을 처음부터 다시 실행하는 경우에는 필요 없음)

USE my_db;

CREATE TABLE IF NOT EXISTS sourced_product (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    product_id    BIGINT       NOT NULL COMMENT '등록된 데모 상품',
    video_id      VARCHAR(20)  NOT NULL COMMENT '제품을 소개한 유튜브 영상 ID (ID만 보관, 영상 1개 → 제품 여러 개 가능)',
    search_query  VARCHAR(255) NULL     COMMENT '설명란에서 뽑은 제품명 (나중에 가격 찾을 때 검색어)',
    price_source  ENUM ('DESCRIPTION', 'TEST') NULL COMMENT 'DESCRIPTION=설명란 금액+가격규칙, TEST=테스트 가격 7701원',
    source_price  BIGINT       NULL     COMMENT '설명란에서 찾은 원래 금액 (TEST 면 NULL)',
    created_at    DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_sourced_video (video_id),
    UNIQUE KEY uk_sourced_product (product_id),
    KEY idx_sourced_price_source (price_source),
    KEY idx_sourced_created (created_at),
    CONSTRAINT fk_sourced_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '유튜브 소개 제품 수집 기록';

CREATE TABLE IF NOT EXISTS sourcing_cursor (
    query_text  VARCHAR(255) NOT NULL COMMENT '수집 검색어 (예: 패션 추천템)',
    page_token  VARCHAR(255) NULL     COMMENT '다음에 받을 유튜브 검색 페이지 (NULL = 첫 페이지)',
    exhausted   BIT(1)       NOT NULL DEFAULT b'0' COMMENT '마지막 페이지까지 확인함',
    updated_at  DATETIME(6)  NULL,
    PRIMARY KEY (query_text)
) ENGINE = InnoDB COMMENT = '수집 검색어별 진행 위치 (이어서 수집)';
