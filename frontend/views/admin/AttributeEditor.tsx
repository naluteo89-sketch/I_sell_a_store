import { Input } from "@/views/ui/Field";
import styles from "./RowEditor.module.css";

type Row = { name: string; value: string };

/** 사양 (소재, 원산지 등 표시용) */
export default function AttributeEditor({
  rows, onAdd, onChange, onRemove,
}: { rows: Row[]; onAdd: () => void; onChange: (i: number, patch: Partial<Row>) => void; onRemove: (i: number) => void }) {
  return (
    <div className={styles.block}>
      <div className={styles.head}>
        <p className={styles.label}>
          사양<span className={styles.hint}>(소재, 원산지 등 표시용)</span>
        </p>
        <button type="button" className={styles.add} onClick={onAdd}>+ 추가</button>
      </div>
      {rows.map((a, i) => (
        <div key={i} className={styles.row}>
          <Input compact placeholder="항목" value={a.name} onChange={(e) => onChange(i, { name: e.target.value })} />
          <Input compact placeholder="내용" value={a.value} onChange={(e) => onChange(i, { value: e.target.value })} />
          <button type="button" className={styles.remove} aria-label="삭제" onClick={() => onRemove(i)}>×</button>
        </div>
      ))}
    </div>
  );
}
