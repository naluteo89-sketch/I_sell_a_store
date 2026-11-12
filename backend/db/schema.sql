-- ============================================================
-- I sell a store · MySQL 8 테이블 생성 스크립트
-- 대상 DB: my_db
-- 실행: MySQL Workbench에서 이 파일 열기 → 번개 아이콘(전체 실행)
--
-- 백엔드 JPA 엔티티와 같은 구조입니다.
-- (백엔드는 ddl-auto=update 라서, 이 스크립트 없이 실행해도 같은 테이블을 만듭니다)
-- 여러 번 실행해도 안전하도록 IF NOT EXISTS / INSERT IGNORE 를 씁니다.
-- ============================================================

CREATE DATABASE IF NOT EXISTS my_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE my_db;

-- ------------------------------------------------------------
-- 1. 카테고리
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    slug        VARCHAR(255) NOT NULL COMMENT 'URL용 영문 키 (fashion, goods ...)',
    name        VARCHAR(255) NOT NULL COMMENT '화면 표시 이름',
    sort_order  INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_category_slug (slug)
) ENGINE = InnoDB COMMENT = '상품 카테고리';

-- ------------------------------------------------------------
-- 2. 상품
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    name             VARCHAR(255)  NOT NULL,
    description      VARCHAR(4000) NULL,
    price            BIGINT        NOT NULL DEFAULT 0 COMMENT '원 단위',
    stock            INT           NOT NULL DEFAULT 0,
    image_url        VARCHAR(1000) NULL     COMMENT '비어 있으면 기본 이미지',
    category_id      BIGINT        NULL,
    metadata         JSON          NULL     COMMENT '업종별 가변 속성 (색상, 사이즈 등)',
    youtube_keyword  VARCHAR(255)  NULL     COMMENT '비어 있으면 "상품명 리뷰"로 검색',
    active           BIT(1)        NOT NULL DEFAULT b'1' COMMENT '판매 중 여부',
    created_at       DATETIME(6)   NULL,
    PRIMARY KEY (id),
    KEY idx_product_category (category_id),
    KEY idx_product_active_created (active, created_at),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES category (id)
) ENGINE = InnoDB COMMENT = '상품';

-- ------------------------------------------------------------
-- 3. 상품별 유튜브 영상 캐시
--    videos / fetched_at : API 데이터 → 30일 안에 갱신 또는 삭제 (유튜브 정책)
--    pinned / excluded   : 관리자가 고른 영상 ID 목록
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_video_cache (
    product_id          BIGINT       NOT NULL COMMENT 'product.id 와 같은 값',
    keyword             VARCHAR(255) NULL,
    videos              JSON         NULL COMMENT '[{videoId,title,channelTitle,thumbnailUrl,viewCount}]',
    fetched_at          DATETIME(6)  NULL COMMENT '마지막 검색 시각',
    pinned_video_ids    JSON         NULL,
    excluded_video_ids  JSON         NULL,
    hidden              BIT(1)       NOT NULL DEFAULT b'0' COMMENT '이 상품만 패널 숨김',
    PRIMARY KEY (product_id),
    KEY idx_pvc_fetched_at (fetched_at)
) ENGINE = InnoDB COMMENT = '상품별 유튜브 검색 결과 캐시';

-- ------------------------------------------------------------
-- 4. 주문
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    order_no                VARCHAR(255) NOT NULL COMMENT 'ORD-XXXXXXXX',
    buyer_name              VARCHAR(255) NULL,
    phone                   VARCHAR(255) NULL,
    address                 VARCHAR(255) NULL,
    total_amount            BIGINT       NOT NULL DEFAULT 0,
    status                  ENUM ('PENDING', 'PAID', 'CANCELED') NULL,
    payment_method          VARCHAR(255) NULL COMMENT 'CARD, KAKAOPAY ... (현재 모의 결제)',
    payment_transaction_id  VARCHAR(255) NULL,
    paid_at                 DATETIME(6)  NULL,
    created_at              DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_order_no (order_no)
) ENGINE = InnoDB COMMENT = '주문';

-- ------------------------------------------------------------
-- 5. 주문 상품 (주문 시점 상품명·가격을 그대로 보관)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_item (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    order_id      BIGINT       NULL,
    product_id    BIGINT       NULL,
    product_name  VARCHAR(255) NULL,
    unit_price    BIGINT       NOT NULL DEFAULT 0,
    quantity      INT          NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_order_item_order (order_id),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE = InnoDB COMMENT = '주문 상품';

-- ------------------------------------------------------------
-- 기본 카테고리 (백엔드 첫 실행 때도 자동으로 들어감)
-- ------------------------------------------------------------
INSERT IGNORE INTO category (slug, name, sort_order) VALUES
    ('fashion', '패션', 0),
    ('goods',   '잡화', 1),
    ('living',  '리빙', 2),
    ('digital', '디지털', 3);

-- 확인
SHOW TABLES;
SELECT * FROM category ORDER BY sort_order;
