import { isBoard } from "@/models/api/communityApi";
import PostEditor from "@/views/community/PostEditor";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.community.writeTitle, robots: { index: false } };
}

export default async function CommunityWritePage({ searchParams }: { searchParams: Promise<{ board?: string }> }) {
  const { board } = await searchParams;
  return <PostEditor initialBoard={isBoard(board) ? board : undefined} />;
}
