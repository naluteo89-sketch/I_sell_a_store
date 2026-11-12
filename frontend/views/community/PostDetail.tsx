"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCommunityPost } from "@/controllers/useCommunity";
import { useI18n } from "@/controllers/useI18n";
import Button, { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import { Input } from "@/views/ui/Field";
import FormField from "@/views/ui/FormField";
import BoardChip from "./BoardChip";
import CommentSection from "./CommentSection";
import PostMeta from "./PostMeta";
import styles from "./PostDetail.module.css";

/** V — 글 상세 (로직은 useCommunityPost) */
export default function PostDetail({ id }: { id: number }) {
  const { t } = useI18n();
  const { data: post, state, toggleLike, addComment, remove, deleteError } = useCommunityPost(id);
  const [askDelete, setAskDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (state === "loading") return <p className={styles.loading}>{t.community.loading}</p>;
  if (!post) {
    return (
      <EmptyState action={<ButtonLink href="/community" variant="outline">{t.community.back}</ButtonLink>}>{t.community.notFound}</EmptyState>
    );
  }

  const submitDelete = async (e: FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    await remove(password);
    setDeleting(false);
  };

  return (
    <div className={styles.page}>
      <Link href="/community" className={styles.back}>
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden>
          <path d="M6.5 1 1.5 6l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t.community.back}
      </Link>

      <article className={styles.article}>
        <BoardChip board={post.board} />
        <h1 className={styles.title}>{post.title}</h1>
        <PostMeta author={post.author} createdAt={post.createdAt} viewCount={post.viewCount} />
        <div className={styles.body}>
          {post.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {post.productId && (
          <Link href={`/products/${post.productId}`} className={styles.product}>
            <span className={styles.productLabel}>{t.community.relatedProduct}</span>
            <span className={styles.productName}>{post.productName ?? `#${post.productId}`}</span>
          </Link>
        )}

        <div className={styles.actions}>
          <button type="button" onClick={toggleLike} aria-pressed={post.liked}
            className={post.liked ? styles.likeOn : styles.like} aria-label={post.liked ? t.community.liked : t.community.like}>
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
              <path d="M10 17s-6.5-3.9-6.5-8.6A3.6 3.6 0 0 1 10 6.2a3.6 3.6 0 0 1 6.5 2.2C16.5 13.1 10 17 10 17Z"
                fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            {t.community.likes(post.likeCount)}
          </button>
          <Button variant="ghost" size="sm" onClick={() => setAskDelete((v) => !v)} aria-expanded={askDelete} aria-controls="delete-form">
            {t.community.delete}
          </Button>
        </div>

        {askDelete && (
          <form id="delete-form" onSubmit={submitDelete} className={styles.deleteForm}>
            <p>{t.community.deleteAsk}</p>
            <div className={styles.deleteRow}>
              <FormField label={t.community.password} error={deleteError ? t.community.deleteFailed : undefined}>
                {(a) => (
                  <Input {...a} type="password" name="delete-password" autoFocus value={password}
                    onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                )}
              </FormField>
              <Button type="submit" variant="outline" loading={deleting}>{t.community.delete}</Button>
            </div>
          </form>
        )}
      </article>

      <CommentSection comments={post.comments} onSubmit={addComment} />
    </div>
  );
}
