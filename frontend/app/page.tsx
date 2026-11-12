import { getI18n } from "@/lib/i18n/server";
import { onePerVideo } from "@/lib/videoGroups";
import { fetchProducts } from "@/models/api/productApi";
import { fetchCategories, fetchSite } from "@/models/api/siteApi";
import { fetchVideoCollections } from "@/models/api/videoApi";
import CommunityTeaser from "@/views/community/CommunityTeaser";
import CategoryShortcuts from "@/views/home/CategoryShortcuts";
import HeroBanner from "@/views/home/HeroBanner";
import ReviewNotice from "@/views/home/ReviewNotice";
import ProductGrid from "@/views/product/ProductGrid";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import Section from "@/views/ui/Section";
import VideoCollectionGrid from "@/views/video/VideoCollectionGrid";

export default async function HomePage() {
  const { t, locale } = await getI18n();
  const [site, products, categories, collections] = await Promise.all([
    fetchSite(locale),
    fetchProducts(locale),
    fetchCategories(locale),
    fetchVideoCollections(locale, { limit: 4 }),
  ]);
  // 같은 영상에서 나온 상품이 도배되지 않게 영상당 1개만 (나머지는 영상 모아보기에서)
  const fresh = onePerVideo(products).slice(0, 8);

  return (
    <>
      <HeroBanner title={site.brand.name} tagline={site.brand.tagline} products={fresh} />
      <CategoryShortcuts categories={categories} />
      {site.features.youtubePanel && <ReviewNotice />}
      <Section title={t.home.newArrivals}>
        {fresh.length === 0 ? <EmptyState dashed>{t.home.emptyProducts}</EmptyState> : <ProductGrid products={fresh} />}
      </Section>
      {collections.length > 0 && (
        <Section title={t.videos.homeTitle} aside={<ButtonLink href="/videos" variant="outline">{t.videos.more}</ButtonLink>}>
          <VideoCollectionGrid collections={collections} />
        </Section>
      )}
      <CommunityTeaser />
    </>
  );
}
