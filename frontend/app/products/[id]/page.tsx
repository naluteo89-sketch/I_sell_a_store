import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductImage from "@/components/ProductImage";
import YoutubePanel from "@/components/YoutubePanel";
import { fetchProduct, fetchSite } from "@/lib/api";
import { won } from "@/lib/format";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await fetchSite();
  const product = await fetchProduct(id).catch(() => null);
  if (!product) notFound();

  const showPanel = site.features.youtubePanel;

  return (
    <div className={`grid gap-8 py-8 ${showPanel ? "lg:grid-cols-[1fr_380px]" : ""}`}>
      {/* 왼쪽: 상품 정보 */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl">
          <ProductImage src={product.imageUrl} name={product.name} />
        </div>
        <div className="space-y-6">
          <div>
            {product.categoryName && <p className="text-sm text-gray-500">{product.categoryName}</p>}
            <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
            <p className="mt-3 text-2xl font-bold">{won(product.price)}</p>
          </div>
          {product.description && <p className="leading-relaxed text-gray-700">{product.description}</p>}
          <p className="text-sm text-gray-500">재고 {product.stock}개</p>
          {site.features.cart && <AddToCart product={product} />}
        </div>
      </div>

      {/* 오른쪽(모바일은 아래): 유튜브 관련 영상 */}
      {showPanel && <YoutubePanel productId={product.id} />}
    </div>
  );
}
