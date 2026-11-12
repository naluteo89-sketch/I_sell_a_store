import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { fetchCategories, fetchProducts, fetchSite } from "@/lib/api";

export default async function HomePage() {
  const [site, products, categories] = await Promise.all([fetchSite(), fetchProducts(), fetchCategories()]);

  return (
    <>
      <section className="my-8 rounded-3xl bg-brand px-8 py-16 text-white">
        <h1 className="text-3xl font-bold md:text-4xl">{site.brand.name}</h1>
        {site.brand.tagline && <p className="mt-3 text-white/80">{site.brand.tagline}</p>}
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand"
        >
          전체 상품 보기
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="rounded-2xl border p-5 font-semibold transition-colors hover:border-brand hover:text-brand"
            >
              {c.name}
              <span className="mt-1 block text-xs font-normal text-gray-400">바로가기 →</span>
            </Link>
          ))}
        </section>
      )}

      {site.features.youtubePanel && (
        <section className="mb-12 rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
          <p className="font-semibold text-gray-900">사기 전에 리뷰 영상부터</p>
          <p className="mt-1">상품을 누르면 옆에 관련 유튜브 리뷰가 바로 떠요. [실행하기]로 그 자리에서 확인하세요.</p>
        </section>
      )}

      <section>
        <h2 className="mb-6 text-xl font-bold">새로 들어온 상품</h2>
        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-gray-500">
            아직 상품이 없습니다. 관리자 API로 데모 상품을 만들어 주세요 (README 참고).
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
