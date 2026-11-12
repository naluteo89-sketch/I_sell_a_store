import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Input({ className, compact, ...rest }: InputHTMLAttributes<HTMLInputElement> & { compact?: boolean }) {
  return <input className={cx(styles.field, compact && styles.compact, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(styles.field, className)} {...rest} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(styles.field, className)} {...rest} />;
}

/** 작은 제목이 붙은 입력칸 */
export function Labeled({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className={styles.labeled}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}

export function Checkbox({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}
