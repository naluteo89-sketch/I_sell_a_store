/* eslint-disable @next/next/no-img-element */

/** 상품 이미지가 없으면 상품명 첫 글자로 기본 이미지를 보여준다 (데모 이미지 저작권 문제 회피) */
export default function ProductImage({
  src,
  name,
  className = "",
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={name} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-4xl font-bold text-gray-400 ${className}`}
      aria-label={name}
    >
      {name.slice(0, 1)}
    </div>
  );
}
