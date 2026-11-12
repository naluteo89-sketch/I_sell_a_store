import { keyOf, type VariantState } from "@/lib/variantGrid";
import { Input } from "@/views/ui/Field";
import styles from "./VariantTable.module.css";

/** 옵션 조합별 추가금·재고·SKU·판매여부 */
export default function VariantTable({
  combos, variantOf, onChange,
}: {
  combos: [string, string][][];
  variantOf: (key: string) => VariantState;
  onChange: (key: string, patch: Partial<VariantState>) => void;
}) {
  return (
    <div className={styles.block}>
      <p className={styles.label}>
        조합별 재고·추가금<span className={styles.hint}>({combos.length}개)</span>
      </p>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>조합</th>
              <th>추가금</th>
              <th>재고</th>
              <th>SKU</th>
              <th>판매</th>
            </tr>
          </thead>
          <tbody>
            {combos.map((pairs) => {
              const key = keyOf(pairs);
              const v = variantOf(key);
              return (
                <tr key={key}>
                  <td className={styles.combo}>{pairs.map(([, val]) => val).join(" / ")}</td>
                  <td>
                    <Input compact type="number" step={100} value={v.additionalPrice}
                      onChange={(e) => onChange(key, { additionalPrice: Number(e.target.value) })} />
                  </td>
                  <td>
                    <Input compact type="number" min={0} value={v.stock}
                      onChange={(e) => onChange(key, { stock: Number(e.target.value) })} />
                  </td>
                  <td>
                    <Input compact placeholder="선택" value={v.sku} onChange={(e) => onChange(key, { sku: e.target.value })} />
                  </td>
                  <td className={styles.center}>
                    <input type="checkbox" checked={v.active} onChange={(e) => onChange(key, { active: e.target.checked })} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
