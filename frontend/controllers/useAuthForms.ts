"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/controllers/useAuth";
import { useI18n } from "@/controllers/useI18n";
import { rememberNext, safeNext } from "@/lib/auth/returnTo";
import { ssoStartUrl } from "@/lib/auth/providers";
import { AuthError, authApi } from "@/models/api/authApi";
import type { AuthProviderId, LoginForm, NicknameStatus, SignupForm } from "@/models/types";

type Errors<K extends string> = Partial<Record<K | "form", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** NIST SP 800-63B: 최소 8자, 64자 이상 허용, 문자 조합 규칙 강제 금지 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** 서버 오류 → 사람이 읽을 문구. 로그인 실패는 이메일·비밀번호 중 무엇이 틀렸는지 밝히지 않는다(계정 존재 노출 방지) */
function serverMessage(e: unknown, t: ReturnType<typeof useI18n>["t"]) {
  if (e instanceof AuthError) {
    if (e.status === 401) return t.auth.errCredentials;
    if (e.status === 429) return t.auth.errTooMany;
  }
  return t.auth.errFailed;
}

/** 첫 오류 칸으로 포커스를 옮긴다 (WCAG 3.3.1 — 오류를 찾지 않아도 되게) */
function focusFirstInvalid(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
}

/** 소셜 로그인: 돌아올 곳을 적어 두고 백엔드 인가 주소로 이동 */
export function useSso(next: string) {
  const [pending, setPending] = useState<AuthProviderId | null>(null);
  const start = (id: AuthProviderId) => {
    setPending(id);
    rememberNext(next);
    window.location.assign(ssoStartUrl(id));
  };
  // 뒤로가기로 돌아오면(bfcache) 버튼이 계속 '진행 중'으로 남지 않게
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setPending(null);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  return { pending, start };
}

export function useProviders() {
  const { locale } = useI18n();
  const [providers, setProviders] = useState<AuthProviderId[] | null>(null);
  useEffect(() => {
    let alive = true;
    authApi.providers(locale).then((p) => alive && setProviders(p));
    return () => {
      alive = false;
    };
  }, [locale]);
  return providers;
}

/** 로그인 직후: 상태 갱신 → 원래 보던 곳으로 */
function useFinish(next: string) {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  return (user: Parameters<typeof setUser>[0]) => {
    setUser(user);
    router.replace(safeNext(next));
    router.refresh();
  };
}

export function useLoginForm(next: string) {
  const { t } = useI18n();
  const finish = useFinish(next);
  const [form, setForm] = useState<LoginForm>({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState<Errors<keyof LoginForm>>({});
  const [busy, setBusy] = useState(false);

  const update = <K extends keyof LoginForm>(key: K, value: LoginForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors<keyof LoginForm> = {};
    if (!EMAIL_RE.test(form.email.trim())) next.email = t.auth.errEmail;
    if (!form.password) next.password = t.auth.errPasswordEmpty;
    setErrors(next);
    if (Object.keys(next).length) return focusFirstInvalid(e.currentTarget);
    setBusy(true);
    try {
      finish(await authApi.login(form));
    } catch (err) {
      setErrors({ form: serverMessage(err, t) });
      setBusy(false);
    }
  };

  return { form, update, errors, busy, submit };
}

export function useSignupForm(next: string) {
  const { t, locale } = useI18n();
  const finish = useFinish(next);
  const [form, setForm] = useState<SignupForm>({ email: "", password: "", nickname: "", agreePrivacy: false });
  const [errors, setErrors] = useState<Errors<keyof SignupForm>>({});
  const [busy, setBusy] = useState(false);

  const nick = useNicknameField(form.nickname, (v) => setForm((f) => ({ ...f, nickname: v })), locale);

  const update = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const next: Errors<keyof SignupForm> = {};
    if (!EMAIL_RE.test(form.email.trim())) next.email = t.auth.errEmail;
    if (form.nickname.trim() && !NICKNAME_RE.test(form.nickname.trim())) next.nickname = t.auth.errNickname;
    else if (nick.status === "TAKEN") next.nickname = t.auth.errNicknameTaken;
    if (form.password.length < PASSWORD_MIN) next.password = t.auth.errPasswordShort;
    if (!form.agreePrivacy) next.agreePrivacy = t.auth.errAgree;
    setErrors(next);
    if (Object.keys(next).length) return focusFirstInvalid(formEl);
    setBusy(true);
    try {
      finish(await authApi.signup(form, locale));
    } catch (err) {
      if (err instanceof AuthError && err.status === 409) {
        // 409 는 이메일 중복 또는 (그 사이 누가 가져간) 닉네임 중복 — 닉네임을 다시 확인해 어느 칸인지 가린다
        const taken = form.nickname.trim() ? (await authApi.checkNickname(form.nickname).catch(() => null)) === "TAKEN" : false;
        setErrors(taken ? { nickname: t.auth.errNicknameTaken } : { email: t.auth.errEmailTaken });
        focusFirstInvalid(formEl);
      } else {
        setErrors({ form: serverMessage(err, t) });
      }
      setBusy(false);
    }
  };

  return { form, update, errors, busy, submit, nick };
}

const NICKNAME_RE = /^[\p{Script=Hangul}A-Za-z0-9_]{2,20}$/u;

/** 내 계정 — 닉네임 바꾸기 (서버 규칙과 같은 검사를 먼저 하고, 중복은 서버가 409로 알려준다) */
export function useNicknameEditor() {
  const { t } = useI18n();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const open = () => {
    setValue(user?.nickname ?? "");
    setError(null);
    setSaved(false);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setError(null);
  };
  const change = (v: string) => {
    setValue(v);
    setError(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = value.trim();
    if (!NICKNAME_RE.test(next)) return setError(t.auth.errNickname);
    if (next === user?.nickname) return cancel();
    setBusy(true);
    try {
      setUser(await authApi.changeNickname(next));
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof AuthError && err.status === 409 ? t.auth.errNicknameTaken
        : err instanceof AuthError && err.status === 400 ? t.auth.errNickname : t.auth.errFailed);
    } finally {
      setBusy(false);
    }
  };

  return { editing, value, error, saved, busy, open, cancel, change, submit };
}

type NickState = "idle" | "checking" | NicknameStatus;

/**
 * 가입 화면 닉네임 칸
 * - 처음에 서버 추천 닉네임을 채워 둔다 → 그대로 두면 그 닉네임으로 가입
 * - 직접 고치면 입력을 멈춘 뒤 0.4초 후 중복 확인 (버튼을 따로 누를 필요 없음)
 */
function useNicknameField(value: string, set: (v: string) => void, locale: "ko" | "en") {
  const [status, setStatus] = useState<NickState>("idle");
  const [suggesting, setSuggesting] = useState(false);
  const suggested = useRef<string | null>(null);

  const suggest = async () => {
    setSuggesting(true);
    try {
      const n = await authApi.suggestNickname(locale);
      suggested.current = n;
      set(n);
      setStatus("AVAILABLE");
    } catch {
      /* 추천을 못 받으면 비워 둔다 → 가입할 때 서버가 자동 생성 */
    } finally {
      setSuggesting(false);
    }
  };

  useEffect(() => {
    suggest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    const v = value.trim();
    if (!v || v === suggested.current) return;
    if (!NICKNAME_RE.test(v)) return setStatus("INVALID");
    setStatus("checking");
    let alive = true;
    const timer = setTimeout(() => {
      authApi.checkNickname(v)
        .then((s) => alive && setStatus(s))
        .catch(() => alive && setStatus("idle"));
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [value]);

  return { status: value.trim() ? status : ("idle" as NickState), suggesting, suggest };
}
