import type { ProductAttribute } from "@/models/types";
import styles from "./AttributeTable.module.css";

/** 상품 사양 (소재, 원산지 등) */
export default function AttributeTable({ attributes }: { attributes: ProductAttribute[] }) {
  if (attributes.length === 0) return null;
  return (
    <dl className={styles.table}>
      {attributes.map((a) => (
        <div key={a.name} className={styles.row}>
          <dt>{a.name}</dt>
          <dd>{a.value}</dd>
        </div>
      ))}
    </dl>
  );
}
