"use client";

import { useProductEditor } from "@/controllers/useProductEditor";
import type { AdminProduct, Category, ProductForm } from "@/models/types";
import Button from "@/views/ui/Button";
import { Input, Labeled, Select, Textarea } from "@/views/ui/Field";
import AttributeEditor from "./AttributeEditor";
import OptionEditor from "./OptionEditor";
import VariantTable from "./VariantTable";
import styles from "./ProductEditor.module.css";

/** V — 상품 등록·수정 폼 (로직은 useProductEditor) */
export default function ProductEditor({
  item, categories, busy, onSave,
}: {
  item: AdminProduct | null;
  categories: Category[];
  busy: boolean;
  onSave: (form: ProductForm) => void;
}) {
  const e = useProductEditor(item, categories, onSave);

  return (
    <form onSubmit={e.submit} className={styles.form}>
      <h2 className={styles.title}>{item ? "상품 수정" : "새 상품 등록"}</h2>

      <div className={styles.group}>
        <Input required placeholder="상품명" value={e.base.name} onChange={(ev) => e.updateBase("name", ev.target.value)} />
        <Textarea placeholder="설명" rows={3} value={e.base.description}
          onChange={(ev) => e.updateBase("description", ev.target.value)} />
        <div className={styles.two}>
          <Labeled label="기본 가격(원)">
            <Input type="number" min={0} value={e.base.price} onChange={(ev) => e.updateBase("price", Number(ev.target.value))} />
          </Labeled>
          <Labeled label={e.hasOptions ? "재고 (옵션 상품은 아래 조합별 재고)" : "재고"}>
            <Input type="number" min={0} value={e.base.stock} disabled={e.hasOptions}
              onChange={(ev) => e.updateBase("stock", Number(ev.target.value))} />
          </Labeled>
        </div>
        <Select value={e.base.categorySlug} onChange={(ev) => e.updateBase("categorySlug", ev.target.value)}>
          <option value="">카테고리 없음</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </Select>
        <Input placeholder="이미지 URL (비우면 기본 이미지)" value={e.base.imageUrl}
          onChange={(ev) => e.updateBase("imageUrl", ev.target.value)} />
        <Input placeholder="유튜브 검색어 (비우면 '상품명 리뷰')" value={e.base.youtubeKeyword}
          onChange={(ev) => e.updateBase("youtubeKeyword", ev.target.value)} />
      </div>

      <AttributeEditor rows={e.attributes} onAdd={e.addAttribute} onChange={e.updateAttribute} onRemove={e.removeAttribute} />
      <OptionEditor rows={e.options} onAdd={e.addOption} onChange={e.updateOption} onRemove={e.removeOption} />
      {e.hasOptions && <VariantTable combos={e.combos} variantOf={e.variantOf} onChange={e.updateVariant} />}

      <Button type="submit" full disabled={busy}>
        {busy ? "저장 중…" : item ? "저장" : "등록 (유튜브 검색 1회 사용)"}
      </Button>
    </form>
  );
}
