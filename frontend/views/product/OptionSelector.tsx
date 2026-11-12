import type { ProductOption } from "@/models/types";
import Button from "@/views/ui/Button";
import styles from "./OptionSelector.module.css";

/** 옵션별 선택지 버튼. 고를 수 없는(재고 없는) 조합은 흐리게 */
export default function OptionSelector({
  options, selected, isAvailable, onPick,
}: {
  options: ProductOption[];
  selected: Record<number, number | undefined>;
  isAvailable: (optionId: number, valueId: number) => boolean;
  onPick: (optionId: number, valueId: number) => void;
}) {
  return (
    <div className={styles.options}>
      {options.map((o) => (
        <div key={o.id}>
          <p className={styles.name}>{o.name}</p>
          <div className={styles.values}>
            {o.values.map((v) => {
              const active = selected[o.id] === v.id;
              const available = isAvailable(o.id, v.id);
              return (
                <Button key={v.id} variant="chip" active={active} disabled={!available && !active}
                  className={!available && !active ? styles.unavailable : undefined}
                  onClick={() => onPick(o.id, v.id)}>
                  {v.name}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
