"use client";

import { useId } from "react";
import type { ProductOption } from "@/models/types";
import Button from "@/views/ui/Button";
import styles from "./OptionSelector.module.css";

/** 옵션별 선택지 버튼. 고를 수 없는(재고 없는) 조합은 흐리게. 선택 상태는 aria-pressed 로 알린다 */
export default function OptionSelector({
  options, selected, isAvailable, onPick, highlightMissing,
}: {
  options: ProductOption[];
  selected: Record<number, number | undefined>;
  isAvailable: (optionId: number, valueId: number) => boolean;
  onPick: (optionId: number, valueId: number) => void;
  highlightMissing?: boolean;
}) {
  const base = useId();
  return (
    <div className={styles.options}>
      {options.map((o) => {
        const missing = selected[o.id] === undefined;
        const labelId = `${base}-${o.id}`;
        return (
          <div key={o.id} role="group" aria-labelledby={labelId} data-missing={missing}
            className={highlightMissing && missing ? styles.groupMissing : styles.group}>
            <p id={labelId} className={styles.name}>{o.name}</p>
            <div className={styles.values}>
              {o.values.map((v) => {
                const active = selected[o.id] === v.id;
                const available = isAvailable(o.id, v.id);
                return (
                  <Button key={v.id} variant="chip" active={active} aria-pressed={active} disabled={!available && !active}
                    className={!available && !active ? styles.unavailable : undefined}
                    onClick={() => onPick(o.id, v.id)}>
                    {v.name}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
