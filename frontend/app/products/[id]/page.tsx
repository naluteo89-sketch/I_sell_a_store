import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import YoutubePanel from "@/components/YoutubePanel";
import { fetchProduct, fetchRelated, fetchSite } from "@/lib/api";
import { won } from "@/lib/format";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [site, product] = await Promise.all([fetchSite(), fetchProduct(id).catch(() => null)]);
  if (!product) notFound();
  const related = await fetchRelated(product.id);

  const showPanel = site.features.youtubePanel;
  const prices = product.variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : product.price;
  const maxPrice = prices.length ? Math.max(...prices) : product.price;

  return (
    <div className="py-6">
      {/* 경로 */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-800">
          홈
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-gray-800">
          상품
        </Link>
        {product.categorySlug && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${product.categorySlug}`} className="hover:text-gray-800">
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className={`grid gap-8 ${showPanel ? "lg:grid-cols-[1fr_380px]" : ""}`}>
        {/* 왼쪽: 상품 정보 */}
        <div className="grid h-fit gap-8 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-2xl">
            <ProductImage src={product.imageUrl} name={product.name} />
          </div>
          <div className="space-y-6">
            <div>
              {product.categoryName && <p className="text-sm text-gray-500">{product.categoryName}</p>}
              <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
              <p className="mt-3 text-2xl font-bold">
                {won(minPrice)}
                {maxPrice > minPrice && <span className="text-base font-normal text-gray-500"> ~ {won(maxPrice)}</span>}
              </p>
              {product.stock <= 0 && <p className="mt-1 text-sm font-semibold text-accent">품절</p>}
            </div>

            {product.description && <p className="leading-relaxed text-gray-700">{product.description}</p>}

            {product.attributes.length > 0 && (
              <dl className="grid grid-cols-[96px_1fr] gap-y-2 border-y py-4 text-sm">
                {product.attributes.map((a) => (
                  <div key={a.name} className="contents">
                    <dt className="text-gray-500">{a.name}</dt>
                    <dd>{a.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {site.features.cart && <AddToCart product={product} />}
          </div>
        </div>

        {/* 오른쪽(모바일은 아래): 유튜브 관련 영상 */}
        {showPanel && <YoutubePanel productId={product.id} />}
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">같은 카테고리 상품</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
