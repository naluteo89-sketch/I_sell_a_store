"use client";

import { useId, type ReactNode } from "react";
import { useI18n } from "@/controllers/useI18n";
import styles from "./FormField.module.css";

export type FieldA11y = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
};

/**
 * 라벨이 항상 보이는 입력 칸 (Baymard: 라벨은 칸 위에, 입력 중에도 보이게)
 * - 필수: 라벨 옆 * (화면낭독기는 input 의 required 로 "필수"를 읽음)
 * - 선택: "(선택)"을 글자로 표시 — 필수·선택을 짐작에 맡기지 않는다
 * - hint / error 는 aria-describedby 로 입력칸에 연결, 오류는 aria-invalid
 */
export default function FormField({
  label, hint, error, optional, children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  children: (a11y: FieldA11y) => ReactNode;
}) {
  const { t } = useI18n();
  const id = useId();
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? (
          <span className={styles.optional}>{t.common.optional}</span>
        ) : (
          <span className={styles.required} aria-hidden>*</span>
        )}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required: !optional })}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** 폼 맨 위 안내: * 의 뜻 (KWCAG 3.3 명확한 지시사항) */
export function RequiredNote() {
  const { t } = useI18n();
  return (
    <p className={styles.note}>
      <span aria-hidden>* </span>
      {t.common.requiredNote}
    </p>
  );
}
