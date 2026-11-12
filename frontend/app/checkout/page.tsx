import CheckoutView from "@/views/checkout/CheckoutView";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.checkout.title, robots: { index: false } };
}

export default function CheckoutPage() {
  return <CheckoutView />;
}
