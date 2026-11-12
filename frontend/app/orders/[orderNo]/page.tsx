import Link from "next/link";
import { notFound } from "next/navigation";
import PriceLine from "@/components/PriceLine";
import { fetchOrder } from "@/lib/api";
import { won } from "@/lib/format";

export default async function OrderCompletePage({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;
  const order = await fetchOrder(orderNo).catch(() => null);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{order.status === "PAID" ? "주문이 완료되었습니다" : "주문 확인"}</h1>
        <p className="mt-2 text-gray-500">주문번호 {order.orderNo}</p>
      </div>
      <div className="space-y-2 rounded-2xl border p-6 text-sm">
        {order.items.map((i) => (
          <PriceLine key={i.productId} name={i.productName} quantity={i.quantity} amount={i.unitPrice * i.quantity} />
        ))}
        <div className="flex justify-between border-t pt-3 text-base font-bold">
          <span>결제 금액</span>
          <span>{won(order.totalAmount)}</span>
        </div>
        <p className="pt-2 text-gray-500">
          {order.buyerName} · {order.phone} · {order.address}
        </p>
      </div>
      <div className="text-center">
        <Link href="/products" className="inline-block rounded-full bg-brand px-6 py-3 text-sm text-white">
          계속 쇼핑하기
        </Link>
      </div>
    </div>
  );
}
