import type { ReactNode } from "react";
import type { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

/** 상품 카드 목록. 상품이 없으면 empty를 보여준다. */
export default function ProductGrid({ products, empty }: { products: Product[]; empty: ReactNode }) {
  if (products.length === 0) return <>{empty}</>;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
