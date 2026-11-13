"use client";

import Link from "next/link";
import { PASSWORD_MAX, PASSWORD_MIN, useSignupForm } from "@/controllers/useAuthForms";
import { useI18n } from "@/controllers/useI18n";
import Button from "@/views/ui/Button";
import { Checkbox, Input } from "@/views/ui/Field";
import FormField from "@/views/ui/FormField";
import AuthShell from "./AuthShell";
import PasswordInput from "./PasswordInput";
import SsoButtons from "./SsoButtons";
import styles from "./Auth.module.css";

/**
 * V — 회원가입. 칸은 이메일·비밀번호 2개뿐 — 닉네임은 서버가 겹치지 않게 자동 생성 (Baymard: 가입 폼 칸 수를 줄일수록 이탈이 준다)
 * 비밀번호 확인 칸 대신 보기 버튼, 문자 조합 규칙 없음 (NIST 800-63B)
 */
export default function SignupForm({ next }: { next: string }) {
  const { t } = useI18n();
  const { form, update, errors, busy, submit, nick } = useSignupForm(next);
  const nickMessage = errors.nickname ?? (nick.status === "INVALID" ? t.auth.errNickname : nick.status === "TAKEN" ? t.auth.errNicknameTaken : undefined);
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      title={t.auth.signupTitle}
      lead={t.auth.signupLead}
      footer={<p>{t.auth.toLogin} <Link href={loginHref} className={styles.switch}>{t.auth.toLoginLink}</Link></p>}
    >
      <SsoButtons next={next} />

      <form onSubmit={submit} noValidate className={styles.form}>
        <FormField label={t.auth.email} error={errors.email}>
          {(a) => (
            <Input {...a} name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false}
              autoCapitalize="none" value={form.email} onChange={(e) => update("email", e.target.value)} />
          )}
        </FormField>
        <FormField label={t.auth.password} hint={t.auth.passwordHint} error={errors.password}>
          {(a) => (
            <PasswordInput {...a} name="new-password" autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX}
              value={form.password} onChange={(e) => update("password", e.target.value)} />
          )}
        </FormField>

        <FormField label={t.auth.nickname} hint={t.auth.nicknameSignupHint} error={nickMessage}>
          {(a) => (
            <div className={styles.nickWrap}>
              <Input {...a} required={false} name="nickname" autoComplete="nickname" spellCheck={false} maxLength={20}
                value={form.nickname} onChange={(e) => update("nickname", e.target.value)} className={styles.nickInput} />
              <button type="button" className={styles.reroll} onClick={nick.suggest} disabled={nick.suggesting}
                aria-label={t.auth.nicknameAnother} title={t.auth.nicknameAnother}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden className={nick.suggesting ? styles.spinning : undefined}>
                  <path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6M16.5 3.5v3.2h-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </FormField>
        <p className={styles.nickStatus} aria-live="polite">
          {!nickMessage && nick.status === "checking" && t.auth.nicknameChecking}
          {!nickMessage && nick.status === "AVAILABLE" && <span className={styles.ok}>✓ {t.auth.nicknameAvailable}</span>}
        </p>

        <div className={styles.agree}>
          <Checkbox label={t.auth.agreePrivacy} name="agreePrivacy" required checked={form.agreePrivacy}
            aria-invalid={errors.agreePrivacy ? true : undefined}
            aria-describedby={errors.agreePrivacy ? "agree-error" : undefined}
            onChange={(e) => update("agreePrivacy", e.target.checked)} />
          {errors.agreePrivacy && <p id="agree-error" className={styles.fieldError} role="alert">{errors.agreePrivacy}</p>}
        </div>

        <div aria-live="polite" className={styles.live}>
          {errors.form && <p className={styles.formError}>{errors.form}</p>}
        </div>
        <Button type="submit" size="lg" full loading={busy}>{busy ? t.auth.signingUp : t.auth.signupSubmit}</Button>
      </form>
    </AuthShell>
  );
}
