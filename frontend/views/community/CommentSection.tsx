"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/controllers/useI18n";
import { submitOnModEnter } from "@/controllers/useUnsavedChanges";
import type { CommunityComment, CommunityCommentForm } from "@/models/types";
import Button from "@/views/ui/Button";
import { Input, Textarea } from "@/views/ui/Field";
import { Avatar } from "./PostMeta";
import styles from "./CommentSection.module.css";

/** 댓글: 말풍선 목록 + 작성 폼 */
export default function CommentSection({
  comments, onSubmit,
}: { comments: CommunityComment[]; onSubmit: (form: CommunityCommentForm) => Promise<void> }) {
  const { t, relative, date } = useI18n();
  const [form, setForm] = useState<CommunityCommentForm>({ author: "", password: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      await onSubmit(form);
      setForm((f) => ({ ...f, body: "" }));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="comments-title">
      <h2 id="comments-title" className={styles.title}>
        {t.community.commentTitle} <span className={styles.count}>{comments.length}</span>
      </h2>

      {comments.length === 0 ? (
        <p className={styles.empty}>{t.community.noComments}</p>
      ) : (
        <ul className={styles.list} aria-live="polite">
          {comments.map((c) => (
            <li key={c.id} className={styles.item}>
              <Avatar name={c.author} size={36} />
              <div className={styles.bubble}>
                <p className={styles.head}>
                  <strong>{c.author}</strong>
                  <time dateTime={c.createdAt} title={date(c.createdAt)}>{relative(c.createdAt)}</time>
                </p>
                <p className={styles.body}>{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.who}>
          <Input required name="nickname" maxLength={20} placeholder={`${t.community.nickname}…`} aria-label={t.community.nickname}
            autoComplete="nickname" spellCheck={false} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <Input required name="comment-password" type="password" maxLength={40} placeholder={`${t.community.password}…`}
            aria-label={t.community.password} autoComplete="new-password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className={styles.compose}>
          <Textarea required name="comment" maxLength={1000} rows={2} className={styles.textarea} placeholder={t.community.commentPlaceholder}
            aria-label={t.community.commentPlaceholder} aria-describedby="comment-hint"
            value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} onKeyDown={submitOnModEnter} />
          <Button type="submit" loading={busy}>{t.community.commentSubmit}</Button>
        </div>
        <p id="comment-hint" className={styles.hint}>{t.community.commentHint}</p>
        <div aria-live="polite">{error && <p className={styles.error}>{t.community.saveFailed}</p>}</div>
      </form>
    </section>
  );
}
