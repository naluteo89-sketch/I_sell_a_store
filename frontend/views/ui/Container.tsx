import type { ReactNode } from "react";
import styles from "./Container.module.css";

/** 페이지 가로 폭 제한 + 좌우 여백 */
export default function Container({ children, as: Tag = "div", id }: { children: ReactNode; as?: "div" | "main"; id?: string }) {
  // main 은 본문 바로가기 대상이라 tabIndex=-1 로 포커스를 받을 수 있게 한다
  return (
    <Tag id={id} tabIndex={Tag === "main" ? -1 : undefined} className={styles.container}>
      {children}
    </Tag>
  );
}
