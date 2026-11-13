"use client";

import Link from "next/link";
import { useLoginForm } from "@/controllers/useAuthForms";
import { useI18n } from "@/controllers/useI18n";
import Button from "@/views/ui/Button";
import { Checkbox, Input } from "@/views/ui/Field";
import FormField from "@/views/ui/FormField";
import AuthShell from "./AuthShell";
import PasswordInput from "./PasswordInput";
import SsoButtons from "./SsoButtons";
import styles from "./Auth.module.css";

/** V — 로그인 (로직은 useLoginForm). 소셜 먼저, 이메일은 아래 */
export default function LoginForm({ next }: { next: string }) {
  const { t } = useI18n();
  const { form, update, errors, busy, submit } = useLoginForm(next);
  const signupHref = next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      title={t.auth.loginTitle}
      lead={t.auth.loginLead}
      footer={
        <>
          <p>
            {t.auth.toSignup} <Link href={signupHref} className={styles.switch}>{t.auth.toSignupLink}</Link>
          </p>
          {next.startsWith("/checkout") && <p className={styles.muted}>{t.auth.guestNote}</p>}
        </>
      }
    >
      <SsoButtons next={next} />

      <form onSubmit={submit} noValidate className={styles.form}>
        <FormField label={t.auth.email} error={errors.email}>
          {(a) => (
            <Input {...a} name="email" type="email" inputMode="email" autoComplete="username" spellCheck={false}
              autoCapitalize="none" value={form.email} onChange={(e) => update("email", e.target.value)} />
          )}
        </FormField>
        <FormField label={t.auth.password} error={errors.password}>
          {(a) => (
            <PasswordInput {...a} name="password" autoComplete="current-password"
              value={form.password} onChange={(e) => update("password", e.target.value)} />
          )}
        </FormField>
        <Checkbox label={t.auth.remember} name="remember" checked={form.remember}
          onChange={(e) => update("remember", e.target.checked)} />

        <div aria-live="polite" className={styles.live}>
          {errors.form && <p className={styles.formError}>{errors.form}</p>}
        </div>
        <Button type="submit" size="lg" full loading={busy}>{busy ? t.auth.loggingIn : t.auth.loginSubmit}</Button>
      </form>
    </AuthShell>
  );
}
