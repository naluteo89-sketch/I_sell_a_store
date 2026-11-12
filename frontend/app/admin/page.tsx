import { notFound } from "next/navigation";
import AdminConsole from "@/components/admin/AdminConsole";
import { fetchCategories } from "@/lib/api";

/**
 * 관리자 화면. 백엔드 관리자 API에 아직 인증이 없으므로
 * NEXT_PUBLIC_ENABLE_ADMIN=true 일 때만 열린다 (로컬 개발용).
 * 운영 배포 전 반드시 로그인(Spring Security)을 붙이고 이 값을 끌 것.
 */
export default async function AdminPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_ADMIN !== "true") notFound();
  const categories = await fetchCategories();
  return <AdminConsole categories={categories} />;
}
