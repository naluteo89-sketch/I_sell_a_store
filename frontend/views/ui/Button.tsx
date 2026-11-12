import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "ghost" | "chip";
type Size = "sm" | "md" | "lg";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function buttonClass(variant: Variant = "primary", size: Size = "md", full = false, active = false) {
  return cx(styles.button, styles[variant], styles[size], full && styles.full, active && styles.active);
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; full?: boolean; active?: boolean };

export default function Button({ variant = "primary", size = "md", full, active, className, type = "button", ...rest }: Props) {
  return <button type={type} className={cx(buttonClass(variant, size, full, active), className)} {...rest} />;
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
