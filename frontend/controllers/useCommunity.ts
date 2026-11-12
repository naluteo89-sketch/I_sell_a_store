"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { communityApi, type ListParams } from "@/models/api/communityApi";
import { useI18n } from "./useI18n";
import { useUnsavedChanges } from "./useUnsavedChanges";
import type { CommunityBoard, CommunityCommentForm, CommunityPage, CommunityPost, CommunityPostForm } from "@/models/types";

type Load<T> = { data: T | null; state: "loading" | "done" | "error" };

/** C — 커뮤니티 목록 (게시판·페이지) */
export function useCommunityList(params: Omit<ListParams, "lang">) {
  const { locale } = useI18n();
  const [result, setResult] = useState<Load<CommunityPage>>({ data: null, state: "loading" });
  const { board, page, size } = params;

  const load = useCallback(() => {
    let alive = true;
    setResult((r) => ({ data: r.data, state: "loading" }));
    communityApi
      .list({ board, page, size, lang: locale })
      .then((data) => alive && setResult({ data, state: "done" }))
      .catch(() => alive && setResult({ data: null, state: "error" }));
    return () => {
      alive = false;
    };
  }, [board, page, size, locale]);

  useEffect(() => load(), [load]);

  return { ...result, reload: load };
}

/** C — 글 상세: 좋아요, 댓글, 삭제 */
export function useCommunityPost(id: number) {
  const router = useRouter();
  const [result, setResult] = useState<Load<CommunityPost>>({ data: null, state: "loading" });
  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    let alive = true;
    setResult({ data: null, state: "loading" });
    communityApi
      .get(id)
      .then((data) => alive && setResult({ data, state: "done" }))
      .catch(() => alive && setResult({ data: null, state: "error" }));
    return () => {
      alive = false;
    };
  }, [id]);

  const toggleLike = async () => {
    const post = result.data;
    if (!post) return;
    // 누르는 즉시 반영하고, 서버 응답으로 맞춘다
    setResult({ state: "done", data: { ...post, liked: !post.liked, likeCount: post.likeCount + (post.liked ? -1 : 1) } });
    try {
      const r = await communityApi.like(id);
      setResult((cur) => (cur.data ? { state: "done", data: { ...cur.data, ...r } } : cur));
    } catch {
      setResult({ state: "done", data: post });
    }
  };

  const addComment = async (form: CommunityCommentForm) => {
    const c = await communityApi.comment(id, { ...form, author: form.author.trim(), body: form.body.trim() });
    setResult((cur) =>
      cur.data ? { state: "done", data: { ...cur.data, comments: [...cur.data.comments, c], commentCount: cur.data.commentCount + 1 } } : cur,
    );
  };

  const remove = async (password: string) => {
    setDeleteError(false);
    try {
      await communityApi.remove(id, password);
      router.push("/community");
      router.refresh();
    } catch {
      setDeleteError(true);
    }
  };

  return { ...result, toggleLike, addComment, remove, deleteError };
}

const EMPTY_FORM = (board: CommunityBoard): CommunityPostForm => ({ board, title: "", body: "", author: "", password: "", productId: null });

/** C — 글쓰기 */
export function useCommunityWrite(initialBoard: CommunityBoard = "free") {
  const router = useRouter();
  const { locale } = useI18n();
  const [form, setForm] = useState<CommunityPostForm>(EMPTY_FORM(initialBoard));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const update = <K extends keyof CommunityPostForm>(key: K, value: CommunityPostForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const [saved, setSaved] = useState(false);
  useUnsavedChanges(!saved && (form.title.trim() !== "" || form.body.trim() !== ""));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const post = await communityApi.create({
        ...form,
        title: form.title.trim(),
        body: form.body.trim(),
        author: form.author.trim(),
      }, locale);
      setSaved(true);
      router.push(`/community/${post.id}`);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return { form, update, submit, busy, error };
}
