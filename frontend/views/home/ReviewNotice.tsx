import styles from "./ReviewNotice.module.css";

export default function ReviewNotice() {
  return (
    <div className={styles.notice}>
      <p className={styles.title}>사기 전에 리뷰 영상부터</p>
      <p>상품을 누르면 옆에 관련 유튜브 리뷰가 바로 떠요. [실행하기]로 그 자리에서 확인하세요.</p>
    </div>
  );
}
