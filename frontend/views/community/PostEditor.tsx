"use client";

import { useCommunityWrite } from "@/controllers/useCommunity";
import { useI18n } from "@/controllers/useI18n";
import { submitOnModEnter } from "@/controllers/useUnsavedChanges";
import { BOARDS } from "@/models/api/communityApi";
import type { CommunityBoard } from "@/models/types";
import Button, { ButtonLink } from "@/views/ui/Button";
import { Input, Textarea } from "@/views/ui/Field";
import FormField, { RequiredNote } from "@/views/ui/FormField";
import styles from "./PostEditor.module.css";

/** V — 글쓰기 (로직은 useCommunityWrite) */
export default function PostEditor({ initialBoard }: { initialBoard?: CommunityBoard }) {
  const { t } = useI18n();
  const { form, update, submit, busy, error } = useCommunityWrite(initialBoard);

  return (
    <form onSubmit={submit} className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.community.writeTitle}</h1>
        <RequiredNote />
      </div>

      <div className={styles.card}>
        <fieldset className={styles.boards}>
          <legend className={styles.legend}>{t.community.board}</legend>
          <div className={styles.segment}>
            {BOARDS.map((b) => (
              <label key={b} className={form.board === b ? styles.optionOn : styles.option}>
                <input type="radio" name="board" value={b} checked={form.board === b} onChange={() => update("board", b)} />
                {t.community.boards[b]}
              </label>
            ))}
          </div>
        </fieldset>

        <FormField label={t.community.postTitle}>
          {(a) => <Input {...a} name="title" maxLength={100} autoComplete="off" value={form.title} onChange={(e) => update("title", e.target.value)} />}
        </FormField>

        <FormField label={t.community.body} hint={t.community.commentHint}>
          {(a) => (
            <Textarea {...a} name="body" maxLength={5000} rows={10} value={form.body}
              onChange={(e) => update("body", e.target.value)} onKeyDown={submitOnModEnter} />
          )}
        </FormField>

        <div className={styles.two}>
          <FormField label={t.community.nickname}>
            {(a) => (
              <Input {...a} name="nickname" maxLength={20} autoComplete="nickname" spellCheck={false}
                value={form.author} onChange={(e) => update("author", e.target.value)} />
            )}
          </FormField>
          <FormField label={t.community.password} hint={t.community.passwordHint}>
            {(a) => (
              <Input {...a} name="post-password" type="password" minLength={4} maxLength={40} autoComplete="new-password"
                value={form.password} onChange={(e) => update("password", e.target.value)} />
            )}
          </FormField>
        </div>

        <FormField label={t.community.productId} hint={t.community.productIdHint} optional>
          {(a) => (
            <Input {...a} name="productId" type="number" min={1} inputMode="numeric" value={form.productId ?? ""}
              onChange={(e) => update("productId", e.target.value ? Number(e.target.value) : null)} />
          )}
        </FormField>

        <div aria-live="polite">{error && <p className={styles.error}>{t.community.saveFailed}</p>}</div>

        <div className={styles.actions}>
          <ButtonLink href="/community" variant="ghost" size="lg">{t.community.cancel}</ButtonLink>
          <Button type="submit" size="lg" loading={busy}>{busy ? t.community.submitting : t.community.submit}</Button>
        </div>
      </div>
    </form>
  );
}
