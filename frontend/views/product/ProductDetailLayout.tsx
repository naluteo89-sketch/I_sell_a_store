import type { ReactNode } from "react";
import styles from "./ProductDetailLayout.module.css";

/** 상세 화면 배치: 왼쪽 상품정보 / 오른쪽(모바일은 아래) 유튜브 패널 */
export default function ProductDetailLayout({ main, side }: { main: ReactNode; side?: ReactNode }) {
  return <div className={side ? styles.withSide : styles.single}>{main}{side}</div>;
}
