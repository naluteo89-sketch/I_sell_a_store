-- ============================================================
-- I sell a store · MySQL 8 테이블 생성 스크립트 (v2: 정규화)
-- 대상 DB: my_db
-- 실행: MySQL Workbench에서 이 파일 열기 → 번개 아이콘(전체 실행)
--
-- ⚠️ v1 테이블을 지우고 새로 만듭니다. (현재 데이터는 카테고리 4개뿐이라 안전)
--    카테고리는 마지막에 다시 넣습니다.
--
-- v1 → v2 변경 요약
--  · product.metadata(JSON)        → product_attribute / product_option / product_option_value
--  · 옵션 조합별 재고·추가금        → product_variant + variant_option_value
--  · product_video_cache(JSON 배열) → youtube_video / product_video / product_youtube_setting
--  · orders 의 배송·결제 칸         → order_shipping / payment
--  · 관리자 로그인용                → admin_user
--  · 모든 관계에 외래키 + 삭제 규칙
-- ============================================================

CREATE DATABASE IF NOT EXISTS my_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE my_db;

SET FOREIGN_KEY_CHECKS = 0;
-- v1
DROP TABLE IF EXISTS product_video_cache;
-- v2 (다시 실행할 때)
DROP TABLE IF EXISTS sourced_product;
DROP TABLE IF EXISTS sourcing_cursor;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS order_item;
DROP TABLE IF EXISTS order_shipping;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_video;
DROP TABLE IF EXISTS youtube_video;
DROP TABLE IF EXISTS product_youtube_setting;
DROP TABLE IF EXISTS variant_option_value;
DROP TABLE IF EXISTS product_variant;
DROP TABLE IF EXISTS product_option_value;
DROP TABLE IF EXISTS product_option;
DROP TABLE IF EXISTS product_attribute;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS admin_user;
DROP TABLE IF EXISTS member;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 상품
-- ============================================================

CREATE TABLE category (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    slug        VARCHAR(255) NOT NULL COMMENT 'URL용 영문 키',
    name        VARCHAR(255) NOT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_category_slug (slug)
) ENGINE = InnoDB COMMENT = '상품 카테고리';

CREATE TABLE product (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    category_id  BIGINT        NULL,
    name         VARCHAR(255)  NOT NULL,
    description  VARCHAR(4000) NULL,
    price        BIGINT        NOT NULL DEFAULT 0 COMMENT '기본 판매가(원). 조합 추가금은 product_variant',
    stock        INT           NOT NULL DEFAULT 0 COMMENT '옵션이 없는 상품의 재고',
    image_url    VARCHAR(1000) NULL,
    active       BIT(1)        NOT NULL DEFAULT b'1' COMMENT '판매 중',
    demo         BIT(1)        NOT NULL DEFAULT b'0' COMMENT '데모 상품 (납품 전 일괄 삭제용)',
    markets      VARCHAR(20)   NOT NULL DEFAULT 'KR' COMMENT '판매 시장 KR · US · KR,US (lang=ko → KR, lang=en → US)',
    name_en      VARCHAR(255)  NULL     COMMENT '영어 화면용 이름 (없으면 name)',
    description_en VARCHAR(4000) NULL   COMMENT '영어 화면용 설명 (없으면 description)',
    created_at   DATETIME(6)   NULL,
    PRIMARY KEY (id),
    KEY idx_product_active_created (active, created_at),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id)
        REFERENCES category (id) ON DELETE SET NULL
) ENGINE = InnoDB COMMENT = '상품';

CREATE TABLE product_attribute (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    product_id  BIGINT       NOT NULL,
    name        VARCHAR(100) NOT NULL COMMENT '예: 소재',
    attr_value  VARCHAR(500) NOT NULL COMMENT '예: 면 100%',
    sort_order  INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_attribute_product (product_id),
    CONSTRAINT fk_attribute_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '상품 사양 (선택하지 않는 표시용 정보)';

CREATE TABLE product_option (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    product_id  BIGINT       NOT NULL,
    name        VARCHAR(100) NOT NULL COMMENT '예: 색상, 사이즈',
    sort_order  INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_option_product_name (product_id, name),
    CONSTRAINT fk_option_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '상품 옵션 그룹';

CREATE TABLE product_option_value (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    option_id   BIGINT       NOT NULL,
    name        VARCHAR(100) NOT NULL COMMENT '예: 블랙, M',
    sort_order  INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_option_value (option_id, name),
    CONSTRAINT fk_option_value_option FOREIGN KEY (option_id)
        REFERENCES product_option (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '옵션 선택지';

CREATE TABLE product_variant (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    product_id        BIGINT       NOT NULL,
    sku               VARCHAR(100) NULL COMMENT '재고관리 코드 (선택)',
    additional_price  BIGINT       NOT NULL DEFAULT 0 COMMENT '기본가에 더하는 금액',
    stock             INT          NOT NULL DEFAULT 0,
    active            BIT(1)       NOT NULL DEFAULT b'1',
    PRIMARY KEY (id),
    UNIQUE KEY uk_variant_sku (sku),
    KEY idx_variant_product (product_id),
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE CASCADE,
    CONSTRAINT chk_variant_stock CHECK (stock >= 0)
) ENGINE = InnoDB COMMENT = '옵션 조합 (예: 블랙+M) 별 재고·추가금';

CREATE TABLE variant_option_value (
    variant_id       BIGINT NOT NULL,
    option_value_id  BIGINT NOT NULL,
    PRIMARY KEY (variant_id, option_value_id),
    KEY idx_vov_option_value (option_value_id),
    CONSTRAINT fk_vov_variant FOREIGN KEY (variant_id)
        REFERENCES product_variant (id) ON DELETE CASCADE,
    CONSTRAINT fk_vov_option_value FOREIGN KEY (option_value_id)
        REFERENCES product_option_value (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '조합 ↔ 선택지 연결';

-- ============================================================
-- 유튜브
--   youtube_video 의 제목·썸네일·조회수는 API 데이터 → fetched_at 기준 30일 안에 갱신 또는 삭제
-- ============================================================

CREATE TABLE youtube_video (
    video_id       VARCHAR(20)   NOT NULL COMMENT '유튜브 영상 ID (11자리)',
    title          VARCHAR(500)  NULL,
    channel_title  VARCHAR(255)  NULL,
    thumbnail_url  VARCHAR(1000) NULL,
    view_count     BIGINT        NOT NULL DEFAULT 0,
    fetched_at     DATETIME(6)   NULL COMMENT 'API에서 받은 시각 (NULL = ID만 보관)',
    PRIMARY KEY (video_id),
    KEY idx_video_fetched_at (fetched_at)
) ENGINE = InnoDB COMMENT = '유튜브 영상 정보 (상품 간 공유)';

CREATE TABLE product_youtube_setting (
    product_id  BIGINT       NOT NULL,
    keyword     VARCHAR(255) NULL COMMENT 'NULL이면 "상품명 리뷰"',
    hidden      BIT(1)       NOT NULL DEFAULT b'0' COMMENT '이 상품 패널 숨김',
    fetched_at  DATETIME(6)  NULL COMMENT '마지막 검색 시각',
    PRIMARY KEY (product_id),
    KEY idx_yt_setting_fetched_at (fetched_at),
    CONSTRAINT fk_yt_setting_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '상품별 유튜브 검색 설정';

CREATE TABLE product_video (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    product_id  BIGINT      NOT NULL,
    video_id    VARCHAR(20) NOT NULL,
    source      ENUM ('SEARCH', 'MANUAL') NULL COMMENT 'SEARCH=자동검색, MANUAL=관리자 직접 추가',
    pinned      BIT(1)      NOT NULL DEFAULT b'0',
    excluded    BIT(1)      NOT NULL DEFAULT b'0',
    rank_no     INT         NOT NULL DEFAULT 0 COMMENT '검색 순위',
    PRIMARY KEY (id),
    UNIQUE KEY uk_product_video (product_id, video_id),
    KEY idx_product_video_video (video_id),
    CONSTRAINT fk_pv_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE CASCADE,
    CONSTRAINT fk_pv_video FOREIGN KEY (video_id)
        REFERENCES youtube_video (video_id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '상품 ↔ 영상 연결 (고정·제외·순위)';

-- ============================================================
-- 상품 수집 (유튜브 소개 제품 → 데모 상품)
-- ============================================================

CREATE TABLE sourced_product (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    product_id    BIGINT       NOT NULL COMMENT '등록된 데모 상품',
    video_id      VARCHAR(20)  NOT NULL COMMENT '제품을 소개한 유튜브 영상 ID (ID만 보관, 영상 1개 → 제품 여러 개 가능)',
    search_query  VARCHAR(255) NULL     COMMENT '설명란에서 뽑은 제품명 (나중에 가격 찾을 때 검색어)',
    price_source  ENUM ('DESCRIPTION', 'TEST') NULL COMMENT 'DESCRIPTION=설명란 금액+가격규칙, TEST=테스트 가격 7701원',
    market        VARCHAR(2)   NOT NULL DEFAULT 'KR' COMMENT 'KR=한국 유튜버, US=영미권 유튜버',
    source_price  BIGINT       NULL     COMMENT '설명란에서 찾은 원래 금액 (TEST 면 NULL). KRW=원, USD=센트',
    source_currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
    created_at    DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_sourced_video (video_id),
    UNIQUE KEY uk_sourced_product (product_id),
    KEY idx_sourced_price_source (price_source),
    KEY idx_sourced_created (created_at),
    CONSTRAINT fk_sourced_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '유튜브 소개 제품 수집 기록';

CREATE TABLE sourcing_cursor (
    query_text  VARCHAR(255) NOT NULL COMMENT '수집 검색어 (예: 패션 추천템)',
    page_token  VARCHAR(255) NULL     COMMENT '다음에 받을 유튜브 검색 페이지 (NULL = 첫 페이지)',
    exhausted   BIT(1)       NOT NULL DEFAULT b'0' COMMENT '마지막 페이지까지 확인함',
    updated_at  DATETIME(6)  NULL,
    PRIMARY KEY (query_text)
) ENGINE = InnoDB COMMENT = '수집 검색어별 진행 위치 (이어서 수집)';

-- ============================================================
-- 주문
-- ============================================================

CREATE TABLE orders (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    order_no      VARCHAR(40) NOT NULL COMMENT '추측하기 어려운 난수 주문번호',
    status        ENUM ('PENDING', 'PAID', 'CANCELED') NULL,
    total_amount  BIGINT      NOT NULL DEFAULT 0,
    created_at    DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_order_no (order_no)
) ENGINE = InnoDB COMMENT = '주문';

CREATE TABLE order_shipping (
    order_id        BIGINT       NOT NULL,
    recipient_name  VARCHAR(100) NOT NULL,
    phone           VARCHAR(30)  NOT NULL,
    zipcode         VARCHAR(10)  NULL,
    address1        VARCHAR(255) NOT NULL COMMENT '기본 주소',
    address2        VARCHAR(255) NULL     COMMENT '상세 주소',
    memo            VARCHAR(255) NULL     COMMENT '배송 요청사항',
    PRIMARY KEY (order_id),
    CONSTRAINT fk_shipping_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '주문 배송지';

CREATE TABLE order_item (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    order_id      BIGINT       NOT NULL,
    product_id    BIGINT       NULL COMMENT '상품이 지워져도 주문 내역은 남도록 NULL 허용',
    variant_id    BIGINT       NULL,
    product_name  VARCHAR(255) NOT NULL COMMENT '주문 당시 상품명 (의도적 보관)',
    option_label  VARCHAR(255) NULL     COMMENT '주문 당시 옵션 (예: 블랙 / M)',
    unit_price    BIGINT       NOT NULL COMMENT '주문 당시 단가 (기본가+추가금)',
    quantity      INT          NOT NULL,
    PRIMARY KEY (id),
    KEY idx_order_item_order (order_id),
    KEY idx_order_item_product (product_id),
    KEY idx_order_item_variant (variant_id),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id)
        REFERENCES product (id) ON DELETE SET NULL,
    CONSTRAINT fk_order_item_variant FOREIGN KEY (variant_id)
        REFERENCES product_variant (id) ON DELETE SET NULL,
    CONSTRAINT chk_order_item_quantity CHECK (quantity > 0)
) ENGINE = InnoDB COMMENT = '주문 상품';

CREATE TABLE payment (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    order_id        BIGINT       NOT NULL,
    method          VARCHAR(30)  NOT NULL COMMENT 'CARD, KAKAOPAY ...',
    amount          BIGINT       NOT NULL,
    status          ENUM ('READY', 'PAID', 'FAILED', 'CANCELED') NULL,
    transaction_id  VARCHAR(100) NULL COMMENT '결제사 거래번호 (현재 모의 결제)',
    fail_reason     VARCHAR(500) NULL,
    requested_at    DATETIME(6)  NULL,
    paid_at         DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_payment_order (order_id),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = '결제 시도 이력';

-- ============================================================
-- 관리자
-- ============================================================

CREATE TABLE admin_user (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    username       VARCHAR(100) NOT NULL,
    password_hash  VARCHAR(100) NOT NULL COMMENT 'BCrypt 해시 (평문 저장 금지)',
    role           VARCHAR(30)  NOT NULL DEFAULT 'ADMIN',
    enabled        BIT(1)       NOT NULL DEFAULT b'1',
    created_at     DATETIME(6)  NULL,
    last_login_at  DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_username (username)
) ENGINE = InnoDB COMMENT = '관리자 계정';

-- ============================================================
-- 기본 데이터
-- ============================================================

INSERT INTO category (slug, name, sort_order) VALUES
    ('fashion', '패션', 0),
    ('goods',   '잡화', 1),
    ('living',  '리빙', 2),
    ('digital', '디지털', 3);

-- 확인
SHOW TABLES;
SELECT * FROM category ORDER BY sort_order;

-- ============================================================
-- 회원 (로그인)
-- ============================================================

CREATE TABLE member (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    email             VARCHAR(254) NOT NULL COMMENT '소문자로 저장',
    nickname          VARCHAR(30)  NOT NULL COMMENT '가입 때 자동 생성 (예: 포근한고래4821)',
    password_hash     VARCHAR(200) NULL     COMMENT '{pbkdf2}… 소셜 전용 회원은 NULL',
    avatar_url        VARCHAR(500) NULL,
    role              VARCHAR(10)  NOT NULL DEFAULT 'USER',
    lang              VARCHAR(5)   NOT NULL DEFAULT 'ko',
    privacy_agreed_at DATETIME(6)  NULL,
    created_at        DATETIME(6)  NULL,
    last_login_at     DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_member_email (email),
    UNIQUE KEY uk_member_nickname (nickname)
) ENGINE = InnoDB COMMENT = '쇼핑몰 회원';
