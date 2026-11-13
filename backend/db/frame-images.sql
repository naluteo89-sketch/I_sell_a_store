-- ============================================================
-- 1이미지 1상품: 같은 영상 상품마다 다른 장면·자르는 위치 배정
-- 백엔드를 켜면 자동으로 실행되므로(FrameImageAssigner) 보통은 실행할 필요 없음.
-- 재시작 없이 바로 적용하고 싶을 때 MySQL Workbench에서 실행.
-- ============================================================
USE my_db;
-- Workbench 안전 업데이트 모드 해제 (이 세션에서만)
SET SQL_SAFE_UPDATES = 0;

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
   AND (p.image_url IS NULL OR p.image_url <> r.new_url);

-- 확인: 이미지 주소가 겹치는 상품 수 (0 이어야 함)
SELECT COUNT(*) - COUNT(DISTINCT image_url) AS duplicated FROM product WHERE active = 1;
