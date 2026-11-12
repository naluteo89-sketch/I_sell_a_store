import { fetchProducts } from "@/models/api/productApi";
import { fetchCategories } from "@/models/api/siteApi";
import type { ProductSort } from "@/models/types";
import ListToolbar, { listHref, SORTS, type ListQuery } from "@/views/product/ListToolbar";
import ProductGrid from "@/views/product/ProductGrid";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import Section from "@/views/ui/Section";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ListQuery> }) {
  const params = await searchParams;
  const sort: ProductSort = SORTS.some((s) => s.id === params.sort) ? (params.sort as ProductSort) : "new";
  const query: ListQuery = { category: params.category, q: params.q, sort };

  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts({ ...query, sort })]);
  const current = categories.find((c) => c.slug === query.category);
  const title = query.q ? `"${query.q}" 검색 결과` : (current?.name ?? "전체 상품");

  return (
    <Section title={title} sub={`${products.length}개 상품`}>
      <ListToolbar categories={categories} query={query} />
      {products.length === 0 ? (
        <EmptyState action={query.q ? <ButtonLink href={listHref(query, { q: undefined })} variant="ghost">검색어 지우기</ButtonLink> : undefined}>
          조건에 맞는 상품이 없습니다.
        </EmptyState>
      ) : (
        <ProductGrid products={products} />
      )}
    </Section>
  );
}
