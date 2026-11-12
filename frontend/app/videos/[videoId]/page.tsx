import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { fetchVideoCollection, isVideoId } from "@/models/api/videoApi";
import Breadcrumb from "@/views/product/Breadcrumb";
import VideoCollectionView from "@/views/video/VideoCollectionView";

type Params = { params: Promise<{ videoId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { videoId } = await params;
  const { locale, t } = await getI18n();
  const c = isVideoId(videoId) ? await fetchVideoCollection(videoId, locale) : null;
  if (!c) return { title: t.videos.notFound };
  return { title: c.video.title ?? t.videos.title, description: t.videos.inThisVideo(c.products.length) };
}

export default async function VideoCollectionPage({ params }: Params) {
  const { videoId } = await params;
  if (!isVideoId(videoId)) notFound();
  const { locale, t } = await getI18n();
  const collection = await fetchVideoCollection(videoId, locale);
  if (!collection) notFound();
  return (
    <div style={{ paddingTop: "var(--space-8)" }}>
      <Breadcrumb items={[{ label: t.product.home, href: "/" }, { label: t.nav.videos, href: "/videos" }, { label: collection.video.channelTitle ?? "" }]} />
      {/* 언어를 바꾸면 다른 영상 세트가 되므로 key 로 선택 상태 초기화 */}
      <VideoCollectionView key={`${locale}-${videoId}`} collection={collection} />
    </div>
  );
}
