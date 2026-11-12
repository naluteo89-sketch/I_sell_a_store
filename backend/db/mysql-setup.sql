-- (선택) root 대신 쓸 전용 계정 만들기
-- 납품·운영 환경에서는 root 대신 전용 계정을 권장합니다.
-- 실행: MySQL Workbench에서 root로 접속 후 실행 ('change-me'는 반드시 바꾸세요)

CREATE USER IF NOT EXISTS 'isellastore'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON my_db.* TO 'isellastore'@'localhost';
FLUSH PRIVILEGES;

-- 이후 backend/config/application.yml 의 username/password 를 이 계정으로 바꾸면 됩니다.
