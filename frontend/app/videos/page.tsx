import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { fetchVideoCollections, isVideoSort } from "@/models/api/videoApi";
import VideoCollectionGrid from "@/views/video/VideoCollectionGrid";
import VideoToolbar, { videosHref } from "@/views/video/VideoToolbar";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import Section from "@/views/ui/Section";

type Query = { q?: string; sort?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<Query> }): Promise<Metadata> {
  const [{ q }, { t }] = await Promise.all([searchParams, getI18n()]);
  return { title: q ? t.videos.searchResult(q) : t.videos.title };
}

/** 리뷰 영상별 상품 모아보기 목록 (언어별로 그 언어 유튜버 영상) */
export default async function VideosPage({ searchParams }: { searchParams: Promise<Query> }) {
  const { q: rawQ, sort: rawSort } = await searchParams;
  const q = rawQ?.trim() || undefined;
  const sort = isVideoSort(rawSort) ? rawSort : "views";
  const { t, locale } = await getI18n();
  const collections = await fetchVideoCollections(locale, { q, sort, minProducts: q ? 1 : 2 });

  return (
    <Section title={q ? t.videos.searchResult(q) : t.videos.title} sub={t.videos.desc}>
      <VideoToolbar q={q} sort={sort} />
      {collections.length === 0 ? (
        <EmptyState dashed action={q ? <ButtonLink href={videosHref(undefined, sort)} variant="outline">{t.list.clearSearch}</ButtonLink> : undefined}>
          {t.videos.empty}
        </EmptyState>
      ) : (
        <VideoCollectionGrid collections={collections} />
      )}
    </Section>
  );
}
