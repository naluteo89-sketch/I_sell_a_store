import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getI18n } from "@/lib/i18n/server";
import { isSort, isView, listHref, VIDEO_VIEW_SORTS, VIEW_COOKIE, type ListQuery, type ListView } from "@/lib/productList";
import type { Locale } from "@/lib/i18n/config";
import { fetchProducts, PAGE_SIZE } from "@/models/api/productApi";
import { fetchCategories } from "@/models/api/siteApi";
import { fetchVideoCollections, fetchVideoPage } from "@/models/api/videoApi";
import type { ProductSort } from "@/models/types";
import PagedResults from "@/views/product/PagedResults";
import ListToolbar from "@/views/product/ListToolbar";
import ProductGrid from "@/views/product/ProductGrid";
import ProductGridSkeleton from "@/views/product/ProductGridSkeleton";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import Section from "@/views/ui/Section";
import VideoCollectionGrid from "@/views/video/VideoCollectionGrid";

type Params = ListQuery & { page?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const i18n = await getI18n();
  const [{ q, category }, categories] = await Promise.all([searchParams, fetchCategories(i18n.locale)]);
  const current = categories.find((c) => c.slug === category);
  return { title: q ? i18n.t.list.searchResult(q) : current ? i18n.category(current.slug, current.name) : i18n.t.list.allProducts };
}

/**
 * 상품 목록.
 * 제목·카테고리·정렬 툴바는 바로 그리고, 상품 격자만 Suspense 로 따로 불러온다.
 * 조건이 바뀔 때마다 key 가 바뀌어 클릭 즉시 스켈레톤이 뜬다 (이전 화면에 멈춰 있지 않음).
 */
export default async function ProductsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  // 보기 방식: 주소(?view=) > 지난번에 고른 방식(쿠키) > 상품별
  const saved = (await cookies()).get(VIEW_COOKIE)?.value;
  const view: ListView = isView(params.view) ? params.view : isView(saved) ? saved : "products";
  const wanted: ProductSort = isSort(params.sort) ? params.sort : "new";
  // 영상별 보기에서 가격·이름 정렬은 의미가 없으므로 최신순으로
  const sort: ProductSort = view === "videos" && !VIDEO_VIEW_SORTS.includes(wanted) ? "new" : wanted;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const query: ListQuery = { category: params.category, q: params.q, sort, view: isView(params.view) ? params.view : undefined };

  const i18n = await getI18n();
  const { t, locale } = i18n;
  const categories = await fetchCategories(locale);
  const current = categories.find((c) => c.slug === query.category);
  const title = query.q ? t.list.searchResult(query.q) : current ? i18n.category(current.slug, current.name) : t.list.allProducts;
  const key = `${view}|${locale}|${query.category ?? ""}|${query.q ?? ""}|${sort}|${page}`;
  const videoView = view === "videos";

  return (
    <>
      {query.q && page === 1 && !videoView && (
        <Suspense key={`v|${key}`} fallback={null}>
          <CreatorVideos locale={locale} q={query.q} />
        </Suspense>
      )}
      <Section
        title={title}
        sub={
          <Suspense key={`c|${key}`} fallback={<span aria-hidden>&nbsp;</span>}>
            {videoView ? <VideoCount locale={locale} query={query} sort={sort} page={page} />
              : <ProductCount locale={locale} query={query} sort={sort} page={page} />}
          </Suspense>
        }
      >
        <ListToolbar categories={categories} query={query} view={view} />
        <Suspense key={`g|${key}`} fallback={<ProductGridSkeleton label={t.common.loading} count={videoView ? 6 : 8} />}>
          {videoView ? <VideoResults locale={locale} query={query} sort={sort} page={page} />
            : <ProductResults locale={locale} query={query} sort={sort} page={page} />}
        </Suspense>
      </Section>
    </>
  );
}

type ResultProps = { locale: Locale; query: ListQuery; sort: ProductSort; page: number };

async function ProductCount({ locale, query, sort, page }: ResultProps) {
  const [{ total }, { t }] = await Promise.all([fetchProducts(locale, { ...query, sort, page }), getI18n()]);
  return <>{t.list.count(total)}</>;
}

async function ProductResults({ locale, query, sort, page }: ResultProps) {
  const [{ items, total }, { t }] = await Promise.all([fetchProducts(locale, { ...query, sort, page }), getI18n()]);
  if (items.length === 0) {
    return (
      <EmptyState dashed action={query.q ? <ButtonLink href={listHref(query, { q: undefined })} variant="outline">{t.list.clearSearch}</ButtonLink> : undefined}>
        {t.list.empty}
      </EmptyState>
    );
  }
  return (
    <PagedResults page={page} totalPages={Math.ceil(total / PAGE_SIZE)} baseHref={listHref(query, {})}>
      <ProductGrid products={items} />
    </PagedResults>
  );
}

const VIDEO_PAGE_SIZE = 12;

const videoPage = ({ locale, query, sort, page }: ResultProps) =>
  fetchVideoPage(locale, { category: query.category, q: query.q, sort, page, size: VIDEO_PAGE_SIZE });

async function VideoCount(props: ResultProps) {
  const [{ total }, { t }] = await Promise.all([videoPage(props), getI18n()]);
  return <>{t.list.videoCount(total)}</>;
}

/** 영상별 보기: 리뷰 영상 하나 = 카드 하나, 그 영상에 나온 상품 미리보기 + 모아보기 */
async function VideoResults(props: ResultProps) {
  const { query, page } = props;
  const [{ items, total }, { t }] = await Promise.all([videoPage(props), getI18n()]);
  if (items.length === 0) {
    return (
      <EmptyState dashed action={query.q ? <ButtonLink href={listHref(query, { q: undefined })} variant="outline">{t.list.clearSearch}</ButtonLink> : undefined}>
        {t.list.empty}
      </EmptyState>
    );
  }
  return (
    <PagedResults page={page} totalPages={Math.ceil(total / VIDEO_PAGE_SIZE)} baseHref={listHref(query, {})}>
      <VideoCollectionGrid collections={items} />
    </PagedResults>
  );
}

/** 검색어가 유튜버 이름과 맞으면 그 유튜버 영상 묶음을 위에 먼저 */
async function CreatorVideos({ locale, q }: { locale: Locale; q: string }) {
  const [collections, { t }] = await Promise.all([fetchVideoCollections(locale, { q, minProducts: 1, limit: 4 }), getI18n()]);
  if (collections.length === 0) return null;
  return (
    <Section title={t.videos.creatorVideos(q)}>
      <VideoCollectionGrid collections={collections} />
    </Section>
  );
}
