import styles from "./SearchBox.module.css";

/** 검색: 스크립트 없이 /products?q= 로 이동 */
export default function SearchBox() {
  return (
    <form action="/products" className={styles.form} role="search">
      <input type="search" name="q" placeholder="상품 검색" aria-label="상품 검색" className={styles.input} />
    </form>
  );
}
