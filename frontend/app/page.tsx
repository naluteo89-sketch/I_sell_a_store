import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts, fetchSite } from "@/lib/api";

export default async function HomePage() {
  const [site, products] = await Promise.all([fetchSite(), fetchProducts()]);

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

      <section>
        <h2 className="mb-6 text-xl font-bold">새로 들어온 상품</h2>
        <ProductGrid
          products={products.slice(0, 8)}
          empty={
            <p className="rounded-xl border border-dashed p-10 text-center text-gray-500">
              아직 상품이 없습니다. 관리자 API로 데모 상품을 만들어 주세요 (README 참고).
            </p>
          }
        />
      </section>
    </>
  );
}
