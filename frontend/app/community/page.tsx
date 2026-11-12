import { isBoard } from "@/models/api/communityApi";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import CommunityView from "@/views/community/CommunityView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.community.title };
}

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ board?: string; page?: string }> }) {
  const { board, page } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  return <CommunityView board={isBoard(board) ? board : undefined} page={p} />;
}
