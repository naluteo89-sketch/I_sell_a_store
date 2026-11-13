"use client";
/* eslint-disable @next/next/no-img-element */
import { useI18n } from "@/controllers/useI18n";
import { useProviders, useSso } from "@/controllers/useAuthForms";
import { providerIcon } from "@/lib/auth/providers";
import authStyles from "./Auth.module.css";
import styles from "./SsoButtons.module.css";

/**
 * V — 소셜 로그인 버튼 묶음
 * - 모든 버튼 같은 크기·같은 무게 (Google: "at least as prominently", 카카오: 타사 강조 금지)
 * - 색·문구는 각사 가이드 그대로, 모서리 12px (카카오 규정)
 * - 순서는 언어(시장)별: 한국 카카오·네이버·Google / 영미권 Google·Apple
 */
export default function SsoButtons({ next }: { next: string }) {
  const { t } = useI18n();
  const providers = useProviders();
  const { pending, start } = useSso(next);

  if (providers === null) {
    return <div className={styles.skeleton} aria-busy="true" aria-label={t.common.loading} />;
  }
  // 켜 둔 소셜 로그인이 없으면 구분선까지 통째로 숨긴다 (이메일 폼만)
  if (providers.length === 0) return null;

  return (
    <>
    <ul className={styles.list}>
      {providers.map((id) => (
        <li key={id}>
          <button
            type="button"
            className={`${styles.button} ${styles[id]}`}
            onClick={() => start(id)}
            disabled={pending !== null}
            aria-busy={pending === id || undefined}
          >
            <img
              src={providerIcon(id)}
              alt=""
              width={18}
              height={18}
              className={styles.icon}
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <span className={styles.label}>{t.auth.sso[id]}</span>
            {pending === id && <span className={styles.spinner} aria-hidden />}
          </button>
        </li>
      ))}
    </ul>
    <p className={authStyles.divider}><span>{t.auth.or}</span></p>
    </>
  );
}
