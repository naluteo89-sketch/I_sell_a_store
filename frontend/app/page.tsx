import { fetchProducts } from "@/models/api/productApi";
import { fetchCategories, fetchSite } from "@/models/api/siteApi";
import CategoryShortcuts from "@/views/home/CategoryShortcuts";
import HeroBanner from "@/views/home/HeroBanner";
import ReviewNotice from "@/views/home/ReviewNotice";
import ProductGrid from "@/views/product/ProductGrid";
import EmptyState from "@/views/ui/EmptyState";
import Section from "@/views/ui/Section";

export default async function HomePage() {
  const [site, products, categories] = await Promise.all([fetchSite(), fetchProducts(), fetchCategories()]);
  return (
    <>
      <HeroBanner title={site.brand.name} tagline={site.brand.tagline} />
      <CategoryShortcuts categories={categories} />
      {site.features.youtubePanel && <ReviewNotice />}
      <Section title="새로 들어온 상품">
        {products.length === 0 ? (
          <EmptyState dashed>아직 상품이 없습니다. 관리자 화면이나 데모 상품 API로 상품을 만들어 주세요 (README 참고).</EmptyState>
        ) : (
          <ProductGrid products={products.slice(0, 8)} />
        )}
      </Section>
    </>
  );
}
