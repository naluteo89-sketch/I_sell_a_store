import Link from "next/link";
import type { Product } from "@/lib/api";
import { won } from "@/lib/format";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const prices = product.variants?.map((v) => v.price) ?? [];
  const minPrice = prices.length ? Math.min(...prices) : product.price;
  const varies = prices.some((p) => p !== minPrice);
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <ProductImage
          src={product.imageUrl}
          name={product.name}
          className={`transition-transform duration-300 group-hover:scale-105 ${soldOut ? "opacity-50" : ""}`}
        />
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">품절</span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        {product.categoryName && <p className="text-xs text-gray-500">{product.categoryName}</p>}
        <p className="font-medium leading-snug">{product.name}</p>
        <p className="font-semibold">
          {won(minPrice)}
          {varies && <span className="text-xs font-normal text-gray-500"> ~</span>}
        </p>
        {product.options?.length > 0 && (
          <p className="text-xs text-gray-400">{product.options.map((o) => o.name).join(" · ")} 선택</p>
        )}
      </div>
    </Link>
  );
}
