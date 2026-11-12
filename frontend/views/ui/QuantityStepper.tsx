import styles from "./QuantityStepper.module.css";

export default function QuantityStepper({
  value, onChange, min = 1, max = 99,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className={styles.stepper}>
      <button type="button" aria-label="수량 줄이기" disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button type="button" aria-label="수량 늘리기" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
