"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useI18n } from "@/controllers/useI18n";
import { Input } from "@/views/ui/Field";
import styles from "./Auth.module.css";

/**
 * 비밀번호 칸 + 보기/숨기기 (NIST 800-63B: 입력값 확인 기능 제공, 붙여넣기 막지 않음)
 * 비밀번호 확인 칸을 두 번 받는 대신 보기 버튼으로 오타를 확인하게 한다.
 */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);
  return (
    <div className={styles.passwordWrap}>
      <Input {...props} type={shown ? "text" : "password"} spellCheck={false} autoCapitalize="none" className={styles.passwordInput} />
      <button
        type="button"
        className={styles.reveal}
        onClick={() => setShown((v) => !v)}
        aria-pressed={shown}
        aria-controls={props.id}
        aria-label={t.auth.showPassword}
        title={shown ? t.auth.hidePassword : t.auth.showPassword}
      >
        {/* 이름은 고정, 상태는 aria-pressed 로 (토글 버튼 이름을 바꾸지 않는다 — WAI-ARIA APG) */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
          {shown && <path d="M3.5 16.5 16.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}
