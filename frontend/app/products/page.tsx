import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { fetchCategories, fetchProducts, type ProductSort } from "@/lib/api";

const SORTS: { id: ProductSort; label: string }[] = [
  { id: "new", label: "최신순" },
  { id: "priceAsc", label: "낮은 가격순" },
  { id: "priceDesc", label: "높은 가격순" },
  { id: "name", label: "이름순" },
];

type Search = { category?: string; q?: string; sort?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { category, q } = await searchParams;
  const sortParam = (await searchParams).sort;
  const sort: ProductSort = SORTS.some((s) => s.id === sortParam) ? (sortParam as ProductSort) : "new";

  const [categories, products] = await Promise.all([
    fetchCategories(),
    fetchProducts({ category, q, sort }),
  ]);
  const current = categories.find((c) => c.slug === category);

  // 현재 조건을 유지한 채 일부만 바꾼 링크
  const href = (patch: Search) => {
    const next = new URLSearchParams();
    const merged = { category, q, sort, ...patch };
    if (merged.category) next.set("category", merged.category);
    if (merged.q) next.set("q", merged.q);
    if (merged.sort && merged.sort !== "new") next.set("sort", merged.sort);
    const s = next.toString();
    return `/products${s ? `?${s}` : ""}`;
  };

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm ${active ? "bg-brand text-white" : "bg-gray-100 text-gray-700"}`;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold">{q ? `"${q}" 검색 결과` : (current?.name ?? "전체 상품")}</h1>
      <p className="mt-1 text-sm text-gray-500">{products.length}개 상품</p>

      <div className="my-6 flex flex-wrap items-center gap-2">
        <Link href={href({ category: undefined })} className={tab(!category)}>
          전체
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={href({ category: c.slug })} className={tab(c.slug === category)}>
            {c.name}
          </Link>
        ))}
        <div className="ml-auto flex gap-3 text-sm">
          {SORTS.map((s) => (
            <Link
              key={s.id}
              href={href({ sort: s.id })}
              className={s.id === sort ? "font-semibold text-brand" : "text-gray-500 hover:text-gray-800"}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>조건에 맞는 상품이 없습니다.</p>
          {q && (
            <Link href={href({ q: undefined })} className="mt-4 inline-block text-sm underline">
              검색어 지우기
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
