import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import OrderView from "@/views/order/OrderView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.order.verifyTitle, robots: { index: false } };
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { orderNo } = await params;
  const { from } = await searchParams;
  return <OrderView orderNo={decodeURIComponent(orderNo)} justOrdered={from !== "lookup"} />;
}
