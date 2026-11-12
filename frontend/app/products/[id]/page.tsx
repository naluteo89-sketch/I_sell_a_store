import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { fetchProduct, fetchRelated } from "@/models/api/productApi";
import { fetchSite } from "@/models/api/siteApi";
import Breadcrumb from "@/views/product/Breadcrumb";
import ProductDetailLayout from "@/views/product/ProductDetailLayout";
import ProductGrid from "@/views/product/ProductGrid";
import ProductInfo from "@/views/product/ProductInfo";
import Section from "@/views/ui/Section";
import YoutubePanel from "@/views/youtube/YoutubePanel";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { locale } = await getI18n();
  const product = await fetchProduct((await params).id, locale).catch(() => null);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description?.slice(0, 150) ?? undefined,
    openGraph: product.imageUrl ? { images: [product.imageUrl] } : undefined,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i18n = await getI18n();
  const { t } = i18n;
  const [site, product] = await Promise.all([fetchSite(i18n.locale), fetchProduct(id, i18n.locale).catch(() => null)]);
  if (!product) notFound();
  const related = await fetchRelated(product.id, i18n.locale);

  return (
    <div style={{ paddingTop: "var(--space-8)" }}>
      <Breadcrumb
        items={[
          { label: t.product.home, href: "/" },
          { label: t.product.products, href: "/products" },
          ...(product.categorySlug
            ? [{ label: i18n.category(product.categorySlug, product.categoryName), href: `/products?category=${product.categorySlug}` }]
            : []),
        ]}
      />
      <ProductDetailLayout
        main={<ProductInfo product={product} canBuy={site.features.cart} />}
        side={site.features.youtubePanel ? <YoutubePanel productId={product.id} /> : undefined}
      />
      {related.length > 0 && (
        <Section title={t.product.related}>
          <ProductGrid products={related} />
        </Section>
      )}
    </div>
  );
}
