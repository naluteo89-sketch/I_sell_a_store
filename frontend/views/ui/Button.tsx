import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "ghost" | "chip";
type Size = "sm" | "md" | "lg";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function buttonClass(variant: Variant = "primary", size: Size = "md", full = false, active = false) {
  return cx(styles.button, styles[variant], styles[size], full && styles.full, active && styles.active);
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  active?: boolean;
  /** 처리 중: 원래 문구를 유지한 채 앞에 스피너를 붙이고 중복 클릭을 막는다 (Vercel 가이드) */
  loading?: boolean;
};

export default function Button({
  variant = "primary", size = "md", full, active, loading, className, type = "button", disabled, children, ...rest
}: Props) {
  return (
    <button type={type} className={cx(buttonClass(variant, size, full, active), className)}
      disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className={styles.spinner} aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href, children, variant = "primary", size = "md", full, className,
}: { href: string; children: ReactNode; variant?: Variant; size?: Size; full?: boolean; className?: string }) {
  return (
    <Link href={href} className={cx(buttonClass(variant, size, full), className)}>
      {children}
    </Link>
  );
}
