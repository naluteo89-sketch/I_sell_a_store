import type { Product } from "@/models/types";

/**
 * 같은 리뷰 영상에서 나온 상품이 목록을 도배하지 않게 영상당 1개만 남긴다.
 * 나머지는 /videos/[videoId] 모아보기에서 본다. 영상 정보가 없는 상품은 그대로 둔다.
 */
export function onePerVideo(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (!p.primaryVideoId) return true;
    if (seen.has(p.primaryVideoId)) return false;
    seen.add(p.primaryVideoId);
    return true;
  });
}

/** 1이미지 1상품: 같은 이미지 주소를 이미 쓰는 다른 상품 찾기 (주소의 쿼리·대소문자 차이는 무시) */
/** 같은 이미지인지 비교용 키: 쿼리는 무시하되, 자르는 위치(#crop=…)는 다른 이미지로 본다 */
export const normalizeImageUrl = (url: string) => {
  const [base, fragment = ""] = url.trim().split("#");
  const crop = /(?:^|&)crop=(left|right)/.exec(fragment)?.[1];
  return (base.split("?")[0] + (crop ? `#crop=${crop}` : "")).toLowerCase();
};

export function findImageOwner<T extends { product: Product }>(items: T[], imageUrl: string, selfId: number | null): T | null {
  const key = normalizeImageUrl(imageUrl);
  if (!key) return null;
  return items.find((i) => i.product.id !== selfId && i.product.imageUrl && normalizeImageUrl(i.product.imageUrl) === key) ?? null;
}
