import type { AdminProduct } from "@/models/types";
import { won } from "@/lib/format";
import Badge from "@/views/ui/Badge";
import styles from "./ProductTable.module.css";

export default function ProductTable({
  items, selected, onOpen, onToggleActive,
}: {
  items: AdminProduct[];
  selected: number | "new" | null;
  onOpen: (id: number) => void;
  onToggleActive: (item: AdminProduct) => void;
}) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>상품</th>
            <th>카테고리</th>
            <th className={styles.num}>가격</th>
            <th className={styles.num}>재고</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.empty}>
                상품이 없습니다.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.product.id} onClick={() => onOpen(item.product.id)}
              className={selected === item.product.id ? styles.selected : undefined}>
              <td>
                <p className={item.active ? styles.name : styles.inactive}>
                  {item.product.name} {item.demo && <Badge>데모</Badge>}
                </p>
                <p className={styles.meta}>
                  {item.product.options.length > 0 &&
                    `${item.product.options.map((o) => o.name).join("·")} 조합 ${item.product.variants.length}개 · `}
                  검색어: {item.effectiveKeyword}
                </p>
              </td>
              <td>{item.product.categoryName ?? "-"}</td>
              <td className={styles.num}>{won(item.product.price)}</td>
              <td className={`${styles.num} ${item.product.stock === 0 ? styles.zero : ""}`}>{item.product.stock}</td>
              <td>
                <button type="button" className={styles.toggle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(item);
                  }}>
                  <Badge tone={item.active ? "success" : "neutral"}>{item.active ? "판매중" : "중지"}</Badge>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
