"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/controllers/useCart";
import { useMounted } from "@/controllers/useMounted";
import styles from "./CartLink.module.css";

export default function CartLink() {
  const count = useCart((s) => cartCount(s.lines));
  const mounted = useMounted();
  return (
    <Link href="/cart" className={styles.link}>
      장바구니
      {mounted && count > 0 && <span className={styles.count}>{count}</span>}
    </Link>
  );
}
