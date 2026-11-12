import type { OptionRow } from "@/lib/variantGrid";
import { Input } from "@/views/ui/Field";
import styles from "./RowEditor.module.css";

/** 옵션 (선택지는 쉼표로 구분) */
export default function OptionEditor({
  rows, onAdd, onChange, onRemove,
}: { rows: OptionRow[]; onAdd: () => void; onChange: (i: number, patch: Partial<OptionRow>) => void; onRemove: (i: number) => void }) {
  return (
    <div className={styles.block}>
      <div className={styles.head}>
        <p className={styles.label}>
          옵션<span className={styles.hint}>(선택지는 쉼표로 구분)</span>
        </p>
        <button type="button" className={styles.add} onClick={onAdd}>+ 옵션 추가</button>
      </div>
      {rows.map((o, i) => (
        <div key={i} className={styles.row}>
          <Input compact placeholder="예: 색상" value={o.name} onChange={(e) => onChange(i, { name: e.target.value })} />
          <Input compact placeholder="예: 블랙, 화이트, 네이비" value={o.valuesText}
            onChange={(e) => onChange(i, { valuesText: e.target.value })} />
          <button type="button" className={styles.remove} aria-label="삭제" onClick={() => onRemove(i)}>×</button>
        </div>
      ))}
    </div>
  );
}
