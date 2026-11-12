"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CommunityPostSummary } from "@/models/types";
import BoardChip from "./BoardChip";
import PostMeta from "./PostMeta";
import styles from "./PostCard.module.css";

export default function PostCard({ post }: { post: CommunityPostSummary }) {
  return (
    <Link href={`/community/${post.id}`} className={styles.card}>
      <div className={styles.body}>
        <BoardChip board={post.board} />
        <h3 className={styles.title}>{post.title}</h3>
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
        <PostMeta author={post.author} createdAt={post.createdAt} commentCount={post.commentCount} likeCount={post.likeCount} />
      </div>
      {post.productImageUrl && (
        <div className={styles.thumb}>
          <img src={post.productImageUrl} alt={post.productName ?? ""} width={88} height={88} loading="lazy" decoding="async" />
        </div>
      )}
    </Link>
  );
}
