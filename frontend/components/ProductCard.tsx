import Link from "next/link";
import type { Product } from "@/lib/api";
import { won } from "@/lib/format";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-xl">
        <ProductImage
          src={product.imageUrl}
          name={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 space-y-1">
        {product.categoryName && <p className="text-xs text-gray-500">{product.categoryName}</p>}
        <p className="font-medium leading-snug">{product.name}</p>
        <p className="font-semibold">{won(product.price)}</p>
      </div>
    </Link>
  );
}
