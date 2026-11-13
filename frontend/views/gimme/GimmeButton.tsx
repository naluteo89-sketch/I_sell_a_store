"use client";

import { useI18n } from "@/controllers/useI18n";
import GimmeIcon from "./GimmeIcon";
import styles from "./Gimme.module.css";

/**
 * 상품 카드 가격 옆의 작은 장바구니 버튼.
 * 평소엔 동그란 아이콘, 카드에 마우스를 올리거나 키보드로 포커스하면 [🛒 Give it to me] 로 펼쳐진다.
 * 누르면 바로 담지 않고 빠른 보기 시트를 연다 (상품 내용을 보고 담게).
 */
export default function GimmeButton({ name, onClick }: { name: string; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button type="button" className={styles.gimme} onClick={onClick} aria-label={t.product.gimmeLabel(name)} aria-haspopup="dialog">
      <GimmeIcon size={18} />
      <span className={styles.text} aria-hidden>{t.product.gimme}</span>
    </button>
  );
}
