import { notFound } from "next/navigation";
import { fetchProduct, fetchRelated } from "@/models/api/productApi";
import { fetchSite } from "@/models/api/siteApi";
import Breadcrumb from "@/views/product/Breadcrumb";
import ProductDetailLayout from "@/views/product/ProductDetailLayout";
import ProductGrid from "@/views/product/ProductGrid";
import ProductInfo from "@/views/product/ProductInfo";
import Section from "@/views/ui/Section";
import YoutubePanel from "@/views/youtube/YoutubePanel";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [site, product] = await Promise.all([fetchSite(), fetchProduct(id).catch(() => null)]);
  if (!product) notFound();
  const related = await fetchRelated(product.id);

  return (
    <div style={{ paddingTop: "var(--space-6)" }}>
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "상품", href: "/products" },
          ...(product.categorySlug ? [{ label: product.categoryName ?? "", href: `/products?category=${product.categorySlug}` }] : []),
        ]}
      />
      <ProductDetailLayout
        main={<ProductInfo product={product} canBuy={site.features.cart} />}
        side={site.features.youtubePanel ? <YoutubePanel productId={product.id} /> : undefined}
      />
      {related.length > 0 && (
        <Section title="같은 카테고리 상품">
          <ProductGrid products={related} />
        </Section>
      )}
    </div>
  );
}
