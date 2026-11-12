import OrderLookupView from "@/views/order/OrderLookupView";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.order.lookupTitle, robots: { index: false } };
}

export default function OrderLookupPage() {
  return <OrderLookupView />;
}
