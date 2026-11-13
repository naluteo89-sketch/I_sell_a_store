-- ============================================================
-- 회원 로그인 테이블 (기존 데이터는 건드리지 않음 — 이 파일만 실행)
-- 실행: MySQL Workbench에서 이 파일 열기 → 번개 아이콘(전체 실행)
-- ============================================================
USE my_db;

CREATE TABLE IF NOT EXISTS member (
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
