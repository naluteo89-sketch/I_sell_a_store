import Link from "next/link";
import { Fragment } from "react";
import styles from "./Breadcrumb.module.css";

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className={styles.crumbs} aria-label="현재 위치">
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && <span className={styles.sep}>/</span>}
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span>{it.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
