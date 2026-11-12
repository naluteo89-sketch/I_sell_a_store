import type { Brand } from "@/lib/api";

export default function Footer({ brand }: { brand: Brand }) {
  return (
    <footer className="mt-24 border-t bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-1 px-4 py-10 text-sm text-gray-500">
        <p className="font-semibold text-gray-700">{brand.name}</p>
        <p>{brand.businessInfo}</p>
        <p>
          고객센터 {brand.phone} · {brand.email}
        </p>
      </div>
    </footer>
  );
}
