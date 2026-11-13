/**
 * 상품 이미지 주소 해석.
 * 수집 상품은 유튜브 영상의 서로 다른 장면 + 자르는 위치(#crop=left|right)를 하나씩 배정받는다 (백엔드 FrameImageAssigner).
 * - 유튜브 장면이면 카드를 꽉 채워(cover) 지정 위치로 자르고
 * - 고화질 장면(maxres1~3·hq720)이 없는 영상이면 보통 화질(hq1~3·hqdefault)로 바꾼다
 */
const YT = /^https:\/\/i\.ytimg\.com\/vi\/([\w-]{11})\/([a-z0-9]+)\.jpg$/i;

export type ImageView = {
  src: string;
  /** CSS object-position */
  position: string;
  /** 유튜브 영상 장면 (꽉 채워 자름) */
  frame: boolean;
  /** 고화질이 없을 때 쓸 주소 */
  fallback: string | null;
};

export function imageView(url: string): ImageView {
  const [base, fragment = ""] = url.trim().split("#");
  const crop = /(?:^|&)crop=(left|right)/.exec(fragment)?.[1];
  const position = crop === "left" ? "0% 50%" : crop === "right" ? "100% 50%" : "50% 50%";
  const m = YT.exec(base);
  if (!m) return { src: base, position, frame: false, fallback: null };
  const [, id, file] = m;
  const low = /^maxres([123])$/.exec(file)?.[1];
  const fallback = low ? `https://i.ytimg.com/vi/${id}/hq${low}.jpg`
    : file === "hq720" || file === "maxresdefault" ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  return { src: base, position, frame: true, fallback };
}

/** 유튜브는 없는 이미지 대신 120×90 회색 그림을 준다 → 이 크기 이하면 "없음"으로 본다 */
export const isMissingFrame = (img: HTMLImageElement) => img.naturalWidth > 0 && img.naturalWidth <= 120;
