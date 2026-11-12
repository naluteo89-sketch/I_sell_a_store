"use client";

import { useAdminProducts } from "@/controllers/useAdminProducts";
import type { Category } from "@/models/types";
import Button from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import ProductEditor from "./ProductEditor";
import ProductTable from "./ProductTable";
import VideoCurator from "./VideoCurator";
import styles from "./AdminConsole.module.css";

/** V — 관리자 화면 (로직은 useAdminProducts) */
export default function AdminConsole({ categories }: { categories: Category[] }) {
  const c = useAdminProducts();

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>관리자</h1>
          <p className={styles.sub}>상품·옵션·조합별 재고 관리와 상품별 유튜브 영상 관리</p>
        </div>
        <Button onClick={() => c.open("new")}>+ 새 상품</Button>
      </div>

      <p className={styles.warning}>로컬 개발용 화면입니다. 관리자 로그인이 붙기 전에는 외부에 공개하지 마세요.</p>

      <div className={styles.layout}>
        <ProductTable items={c.items} selected={c.selected} onOpen={c.open} onToggleActive={c.toggleActive} />

        <div className={styles.side}>
          {c.message && <p className={styles.message}>{c.message}</p>}
          {c.selected === null && <EmptyState dashed>왼쪽에서 상품을 고르거나 새 상품을 등록하세요.</EmptyState>}
          {c.selected !== null && (c.selected === "new" || c.current) && (
            <ProductEditor key={`${c.selected}-${c.version}`} item={c.current} categories={categories} busy={c.busy} onSave={c.save} />
          )}
          {c.current && <VideoCurator key={c.current.product.id} productId={c.current.product.id} />}
        </div>
      </div>
    </div>
  );
}
