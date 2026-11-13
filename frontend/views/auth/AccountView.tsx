"use client";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/controllers/useAuth";
import { useNicknameEditor } from "@/controllers/useAuthForms";
import { useI18n } from "@/controllers/useI18n";
import { loginHref } from "@/lib/auth/returnTo";
import Button, { ButtonLink } from "@/views/ui/Button";
import { Input } from "@/views/ui/Field";
import FormField from "@/views/ui/FormField";
import AuthShell from "./AuthShell";
import styles from "./Account.module.css";

/** V — 내 계정: 누구로 로그인했는지, 어떤 방식이 연결됐는지, 로그아웃 */
export default function AccountView() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, status, ensure, logout } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const nick = useNicknameEditor();

  useEffect(() => {
    ensure();
  }, [ensure]);

  useEffect(() => {
    if (status === "guest" && !leaving) router.replace(loginHref("/account"));
  }, [status, leaving, router]);

  if (!user) {
    return (
      <div className={styles.wait}>
        <p role="status">{t.common.loading}</p>
      </div>
    );
  }

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    router.replace("/");
    router.refresh();
  };

  return (
    <AuthShell title={t.auth.accountTitle} lead={user.email}>
      <div className={styles.profile}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" width={56} height={56} className={styles.avatar} referrerPolicy="no-referrer" />
        ) : (
          <span className={styles.avatar} aria-hidden>{user.nickname.charAt(0).toUpperCase() || "?"}</span>
        )}
        {nick.editing ? (
          <form onSubmit={nick.submit} className={styles.nickForm} noValidate>
            <FormField label={t.auth.nickname} hint={t.auth.nicknameHint} error={nick.error ?? undefined}>
              {(a) => (
                <Input {...a} name="nickname" autoComplete="nickname" spellCheck={false} maxLength={20} autoFocus
                  value={nick.value} onChange={(e) => nick.change(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && nick.cancel()} />
              )}
            </FormField>
            <div className={styles.nickActions}>
              <Button variant="ghost" onClick={nick.cancel}>{t.auth.nicknameCancel}</Button>
              <Button type="submit" loading={nick.busy}>{nick.busy ? t.auth.nicknameSaving : t.auth.nicknameSave}</Button>
            </div>
          </form>
        ) : (
          <div className={styles.nickRow}>
            <p className={styles.name}>{user.nickname}</p>
            <Button variant="chip" size="sm" onClick={nick.open} aria-label={`${t.auth.nickname} ${t.auth.nicknameEdit}`}>
              {t.auth.nicknameEdit}
            </Button>
          </div>
        )}
        <p role="status" className={styles.saved}>{nick.saved ? t.auth.nicknameSaved : ""}</p>
      </div>

      <h2 className={styles.subhead}>{t.auth.connected}</h2>
      <ul className={styles.methods}>
        {user.providers.map((p) => (
          <li key={p} className={styles.method}>
            {p === "password" ? t.auth.passwordMethod : t.auth.ssoName[p]}
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <ButtonLink href="/orders" variant="outline" full>{t.auth.myOrders}</ButtonLink>
        <Button variant="ghost" full loading={leaving} onClick={onLogout}>{leaving ? t.auth.loggingOut : t.auth.logout}</Button>
      </div>
    </AuthShell>
  );
}
