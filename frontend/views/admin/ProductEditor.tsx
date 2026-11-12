"use client";
/* eslint-disable @next/next/no-img-element */

import { useProductEditor } from "@/controllers/useProductEditor";
import type { AdminProduct, Category, ProductForm } from "@/models/types";
import Button from "@/views/ui/Button";
import { Checkbox, Input, Labeled, Select, Textarea } from "@/views/ui/Field";
import AttributeEditor from "./AttributeEditor";
import OptionEditor from "./OptionEditor";
import VariantTable from "./VariantTable";
import styles from "./ProductEditor.module.css";

/** V — 상품 등록·수정 폼 (로직은 useProductEditor) */
export default function ProductEditor({
  item, categories, busy, onSave, others,
}: {
  item: AdminProduct | null;
  categories: Category[];
  busy: boolean;
  onSave: (form: ProductForm) => void;
  /** 전체 상품 (같은 이미지 중복 확인용) */
  others: AdminProduct[];
}) {
  const e = useProductEditor(item, categories, onSave, others);

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
        <Labeled label="대표 이미지 1장 (1이미지 1상품: 다른 상품과 같은 이미지 금지)">
          <div className={styles.imageRow}>
            {e.base.imageUrl ? <img src={e.base.imageUrl} alt="" className={styles.preview} /> : <span className={styles.preview} />}
            <Input placeholder="이미지 URL (비우면 기본 이미지)" value={e.base.imageUrl} aria-invalid={e.imageOwner ? true : undefined}
              onChange={(ev) => e.updateBase("imageUrl", ev.target.value)} />
          </div>
        </Labeled>
        {e.imageOwner && (
          <p className={styles.error} role="alert">
            이미 &quot;{e.imageOwner.product.name}&quot; 상품이 쓰는 이미지입니다. 상품마다 다른 이미지를 넣어 주세요.
          </p>
        )}
        <Input placeholder="유튜브 검색어 - 한국어 (비우면 '상품명 리뷰')" value={e.base.youtubeKeyword}
          onChange={(ev) => e.updateBase("youtubeKeyword", ev.target.value)} />
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>판매 지역 — 고른 언어 화면에만 노출됩니다</legend>
        <div className={styles.markets}>
          <Checkbox label="한국 (한국어 화면)" checked={e.base.markets.includes("KR")} onChange={() => e.toggleMarket("KR")} />
          <Checkbox label="영미권 (영어 화면)" checked={e.base.markets.includes("US")} onChange={() => e.toggleMarket("US")} />
        </div>
        {e.sellsUS && (
          <>
            <Input placeholder="영문 상품명 (필수)" value={e.base.nameEn} onChange={(ev) => e.updateBase("nameEn", ev.target.value)} lang="en" />
            <Textarea placeholder="영문 설명" rows={3} value={e.base.descriptionEn} lang="en"
              onChange={(ev) => e.updateBase("descriptionEn", ev.target.value)} />
            <Input placeholder="영어 유튜브 검색어 (비우면 '영문 상품명 review')" value={e.base.youtubeKeywordEn} lang="en"
              onChange={(ev) => e.updateBase("youtubeKeywordEn", ev.target.value)} />
          </>
        )}
      </fieldset>

      <AttributeEditor rows={e.attributes} onAdd={e.addAttribute} onChange={e.updateAttribute} onRemove={e.removeAttribute} />
      <OptionEditor rows={e.options} onAdd={e.addOption} onChange={e.updateOption} onRemove={e.removeOption} />
      {e.hasOptions && <VariantTable combos={e.combos} variantOf={e.variantOf} onChange={e.updateVariant} />}

      {e.problem && <p className={styles.error} role="alert">{e.problem}</p>}

      <Button type="submit" full loading={busy}>
        {busy ? "저장 중…" : item ? "저장" : "등록 (유튜브 검색 1회 사용)"}
      </Button>
    </form>
  );
}
