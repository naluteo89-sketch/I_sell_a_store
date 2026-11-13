-- 기존 my_db 에 '언어별 시장(한국/영미권)' 칸 추가 (데이터는 그대로, 기존 상품은 한국 시장 KR)
-- 규격: frontend/docs/market-api.md
-- 실행: MySQL Workbench에서 이 파일 열기 → 번개 아이콘 (한 번만)
-- (schema.sql 을 처음부터 다시 실행하는 경우에는 필요 없음)

USE my_db;

ALTER TABLE product
    ADD COLUMN markets        VARCHAR(20)   NOT NULL DEFAULT 'KR' COMMENT '판매 시장 KR · US · KR,US (lang=ko → KR, lang=en → US)' AFTER demo,
    ADD COLUMN name_en        VARCHAR(255)  NULL     COMMENT '영어 화면용 이름 (없으면 name)' AFTER markets,
    ADD COLUMN description_en VARCHAR(4000) NULL     COMMENT '영어 화면용 설명 (없으면 description)' AFTER name_en;

ALTER TABLE sourced_product
    ADD COLUMN market          VARCHAR(2) NOT NULL DEFAULT 'KR' COMMENT 'KR=한국 유튜버, US=영미권 유튜버' AFTER price_source,
    ADD COLUMN source_currency VARCHAR(3) NOT NULL DEFAULT 'KRW' AFTER source_price,
    MODIFY COLUMN source_price BIGINT NULL COMMENT '설명란에서 찾은 원래 금액 (TEST 면 NULL). KRW=원, USD=센트';
