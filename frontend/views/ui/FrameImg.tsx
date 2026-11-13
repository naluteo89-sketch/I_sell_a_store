"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, type ImgHTMLAttributes } from "react";
import { imageView, isMissingFrame } from "@/lib/productImage";

/**
 * 상품 이미지 주소(#crop 위치·고화질 대체 포함)를 그대로 받아 그리는 작은 <img>.
 * 썸네일 미리보기·히어로처럼 ProductImage 틀이 필요 없는 곳에서 쓴다.
 */
export default function FrameImg({ url, style, ...rest }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { url: string }) {
  const view = imageView(url);
  const [src, setSrc] = useState(view.src);
  const toFallback = () => view.fallback && src !== view.fallback && setSrc(view.fallback);
  return (
    <img
      {...rest}
      src={src}
      style={{ objectFit: "cover", objectPosition: view.position, ...style }}
      onLoad={(e) => isMissingFrame(e.currentTarget) && toFallback()}
      onError={toFallback}
    />
  );
}
