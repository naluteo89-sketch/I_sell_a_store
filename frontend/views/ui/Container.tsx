import type { ReactNode } from "react";
import styles from "./Container.module.css";

/** 페이지 가로 폭 제한 + 좌우 여백 */
export default function Container({ children, as: Tag = "div" }: { children: ReactNode; as?: "div" | "main" }) {
  return <Tag className={styles.container}>{children}</Tag>;
}
