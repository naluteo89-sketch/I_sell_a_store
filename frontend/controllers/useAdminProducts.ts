"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/models/api/adminApi";
import type { AdminProduct, ProductForm } from "@/models/types";

/** C — 관리자 상품 목록·선택·저장·판매상태 */
export function useAdminProducts() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** 저장 후 편집기를 서버 값으로 다시 채우기 위한 번호 */
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    try {
      setItems(await adminApi.products());
    } catch {
      setMessage("백엔드에 연결할 수 없습니다. 서버가 켜져 있는지 확인하세요.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = (id: number | "new") => {
    setMessage(null);
    setSelected(id);
  };

  const save = async (form: ProductForm) => {
    setBusy(true);
    setMessage(null);
    try {
      if (selected === "new") {
        const created = await adminApi.create(form);
        setSelected(created.product.id);
        setMessage("등록했습니다. 유튜브 영상도 함께 검색했습니다.");
      } else if (typeof selected === "number") {
        await adminApi.update(selected, form);
        setMessage("저장했습니다.");
      }
      await load();
      setVersion((v) => v + 1);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (item: AdminProduct) => {
    if (item.active) await adminApi.deactivate(item.product.id);
    else await adminApi.activate(item.product.id);
    await load();
  };

  const current = typeof selected === "number" ? items.find((i) => i.product.id === selected) ?? null : null;

  return { items, selected, current, message, busy, version, open, save, toggleActive };
}
