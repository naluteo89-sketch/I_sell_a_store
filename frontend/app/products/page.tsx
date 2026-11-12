import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { isSort, listHref, type ListQuery } from "@/lib/productList";
import { fetchProducts } from "@/models/api/productApi";
import { fetchCategories } from "@/models/api/siteApi";
import { fetchVideoCollections } from "@/models/api/videoApi";
import VideoCollectionGrid from "@/views/video/VideoCollectionGrid";
import ListToolbar from "@/views/product/ListToolbar";
import ProductGrid from "@/views/product/ProductGrid";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import Section from "@/views/ui/Section";

export async function generateMetadata({ searchParams }: { searchParams: Promise<ListQuery> }): Promise<Metadata> {
  const i18n = await getI18n();
  const [{ q, category }, categories] = await Promise.all([searchParams, fetchCategories(i18n.locale)]);
  const current = categories.find((c) => c.slug === category);
  return { title: q ? i18n.t.list.searchResult(q) : current ? i18n.category(current.slug, current.name) : i18n.t.list.allProducts };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ListQuery> }) {
  const params = await searchParams;
  const sort = isSort(params.sort) ? params.sort : "new";
  const query: ListQuery = { category: params.category, q: params.q, sort };

  const i18n = await getI18n();
  // 검색어는 상품명뿐 아니라 유튜버 이름에도 맞춰 본다 (백엔드: 상품명 + 연결된 영상의 채널명)
  const [categories, products, creatorVideos] = await Promise.all([
    fetchCategories(i18n.locale),
    fetchProducts(i18n.locale, { ...query, sort }),
    query.q ? fetchVideoCollections(i18n.locale, { q: query.q, minProducts: 1, limit: 4 }) : Promise.resolve([]),
  ]);
  const { t } = i18n;
  const current = categories.find((c) => c.slug === query.category);
  const title = query.q ? t.list.searchResult(query.q) : current ? i18n.category(current.slug, current.name) : t.list.allProducts;

  return (
    <>
    {creatorVideos.length > 0 && (
      <Section title={t.videos.creatorVideos(query.q ?? "")}>
        <VideoCollectionGrid collections={creatorVideos} />
      </Section>
    )}
    <Section title={title} sub={t.list.count(products.length)}>
      <ListToolbar categories={categories} query={query} />
      {products.length === 0 ? (
        <EmptyState dashed action={query.q ? <ButtonLink href={listHref(query, { q: undefined })} variant="outline">{t.list.clearSearch}</ButtonLink> : undefined}>
          {t.list.empty}
        </EmptyState>
      ) : (
        <ProductGrid products={products} />
      )}
    </Section>
    </>
  );
}
