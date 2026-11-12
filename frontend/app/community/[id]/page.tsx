import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import PostDetail from "@/views/community/PostDetail";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.community.title };
}

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <PostDetail id={id} />;
}
