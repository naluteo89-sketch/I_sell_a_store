"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";

export default function CartLink() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const mounted = useMounted();

  return (
    <Link href="/cart" className="relative rounded-full px-3 py-1.5 text-sm font-medium hover:bg-gray-100">
      장바구니
      {mounted && count > 0 && (
        <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-white">{count}</span>
      )}
    </Link>
  );
}
