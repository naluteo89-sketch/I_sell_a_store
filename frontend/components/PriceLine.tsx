import { won } from "@/lib/format";

/** "상품명 × 수량 ......... 금액" 한 줄 (주문서·주문 완료 화면 공통) */
export default function PriceLine({ name, quantity, amount }: { name: string; quantity: number; amount: number }) {
  return (
    <div className="flex justify-between">
      <span>
        {name} × {quantity}
      </span>
      <span>{won(amount)}</span>
    </div>
  );
}
