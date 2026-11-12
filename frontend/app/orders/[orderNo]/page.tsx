import OrderView from "@/views/order/OrderView";

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
