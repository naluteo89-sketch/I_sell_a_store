import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { fetchCategories, fetchProducts } from "@/lib/api";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts(category)]);
  const current = categories.find((c) => c.slug === category);

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm ${active ? "bg-brand text-white" : "bg-gray-100 text-gray-700"}`;

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">{current?.name ?? "전체 상품"}</h1>
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/products" className={tab(!category)}>
          전체
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/products?category=${c.slug}`} className={tab(c.slug === category)}>
            {c.name}
          </Link>
        ))}
      </div>
      <ProductGrid products={products} empty={<p className="py-20 text-center text-gray-500">상품이 없습니다.</p>} />
    </div>
  );
}
