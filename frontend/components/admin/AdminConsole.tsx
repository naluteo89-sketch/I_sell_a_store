"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminProduct, type Category, type ProductForm } from "@/lib/api";
import { won } from "@/lib/format";
import ProductEditor from "./ProductEditor";
import VideoCurator from "./VideoCurator";

export default function AdminConsole({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** 저장 후 편집기를 서버 값으로 다시 채우기 위한 키 */
  const [editorVersion, setEditorVersion] = useState(0);

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
      setEditorVersion((v) => v + 1);
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

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">관리자</h1>
          <p className="text-sm text-gray-500">상품·옵션·조합별 재고 관리와 상품별 유튜브 영상 관리</p>
        </div>
        <button type="button" onClick={() => open("new")} className="rounded-full bg-brand px-4 py-2 text-sm text-white">
          + 새 상품
        </button>
      </div>

      <p className="mb-6 rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-800">
        로컬 개발용 화면입니다. 관리자 로그인이 붙기 전에는 외부에 공개하지 마세요.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_560px]">
        {/* 상품 목록 */}
        <div className="h-fit overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">상품</th>
                <th className="px-4 py-2">카테고리</th>
                <th className="px-4 py-2 text-right">가격</th>
                <th className="px-4 py-2 text-right">재고</th>
                <th className="px-4 py-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    상품이 없습니다.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr
                  key={item.product.id}
                  onClick={() => open(item.product.id)}
                  className={`cursor-pointer border-t hover:bg-gray-50 ${selected === item.product.id ? "bg-gray-100" : ""}`}
                >
                  <td className="px-4 py-2">
                    <p className={item.active ? "font-medium" : "text-gray-400 line-through"}>
                      {item.product.name}
                      {item.demo && <span className="ml-1 rounded bg-gray-200 px-1 text-[10px] text-gray-600">데모</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.product.options.length > 0 &&
                        `${item.product.options.map((o) => o.name).join("·")} 조합 ${item.product.variants.length}개 · `}
                      검색어: {item.effectiveKeyword}
                    </p>
                  </td>
                  <td className="px-4 py-2">{item.product.categoryName ?? "-"}</td>
                  <td className="px-4 py-2 text-right">{won(item.product.price)}</td>
                  <td className={`px-4 py-2 text-right ${item.product.stock === 0 ? "text-accent" : ""}`}>
                    {item.product.stock}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive(item);
                      }}
                      className={`rounded-full px-2 py-0.5 text-xs ${item.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}
                    >
                      {item.active ? "판매중" : "중지"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 편집 영역 */}
        <div className="space-y-6">
          {message && <p className="rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700">{message}</p>}

          {selected === null && (
            <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-400">
              왼쪽에서 상품을 고르거나 새 상품을 등록하세요.
            </p>
          )}

          {selected !== null && (selected === "new" || current) && (
            <ProductEditor
              key={`${selected}-${editorVersion}`}
              item={current}
              categories={categories}
              busy={busy}
              onSave={save}
            />
          )}

          {current && <VideoCurator key={current.product.id} productId={current.product.id} />}
        </div>
      </div>
    </div>
  );
}
