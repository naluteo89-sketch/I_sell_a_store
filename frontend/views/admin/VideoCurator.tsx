"use client";

import { useState } from "react";
import { useVideoCurator } from "@/controllers/useVideoCurator";
import type { Locale } from "@/lib/i18n/config";
import Button from "@/views/ui/Button";
import { Checkbox, Input } from "@/views/ui/Field";
import VideoRow from "./VideoRow";
import styles from "./VideoCurator.module.css";

/** V — 상품별 유튜브 영상 고정·제외·숨김·재검색 (로직은 useVideoCurator) */
export default function VideoCurator({ productId }: { productId: number }) {
  const [lang, setLang] = useState<Locale>("ko");
  const c = useVideoCurator(productId, lang);
  const [input, setInput] = useState("");

  const tabs = (
    <div className={styles.tabs} role="group" aria-label="영상 언어">
      {(["ko", "en"] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} className={lang === l ? styles.tabOn : styles.tab} onClick={() => setLang(l)}>
          {l === "ko" ? "한국어 유튜버 (한국 화면)" : "영어권 유튜버 (영어 화면)"}
        </button>
      ))}
    </div>
  );

  if (!c.view) return <div className={styles.box}>{tabs}<p className={styles.loading}>영상 정보를 불러오는 중…</p></div>;
  const v = c.view;

  return (
    <div className={styles.box}>
      {tabs}
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>유튜브 영상</h2>
          <p className={styles.meta}>
            검색어 &quot;{v.keyword}&quot; ·{" "}
            {v.fetchedAt ? `마지막 검색 ${new Date(v.fetchedAt).toLocaleString("ko-KR")}` : "아직 검색 안 함"}
            {lang === "en" && " · 영어·미국 기준 검색"}
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={c.busy || !v.apiKeyConfigured} onClick={c.refresh}
          title="유튜브 검색 1회(하루 기본 100회 중)를 사용합니다">
          다시 검색
        </Button>
      </div>

      {!v.apiKeyConfigured && (
        <p className={styles.warning}>YOUTUBE_API_KEY가 설정되지 않아 검색할 수 없습니다. 영상 주소를 직접 고정하는 것은 가능합니다.</p>
      )}

      <Checkbox checked={v.hidden} onChange={(e) => c.setHidden(e.target.checked)} label="이 상품은 영상 패널 숨기기" />

      <div className={styles.pin}>
        <Input placeholder="고정할 영상 주소 또는 ID" value={input} onChange={(e) => setInput(e.target.value)} />
        <Button disabled={c.busy} onClick={() => c.pinByUrl(input) && setInput("")}>
          고정
        </Button>
      </div>

      {c.error && <p className={styles.error}>{c.error}</p>}

      <ul className={styles.list}>
        {c.rows.length === 0 && <li className={styles.empty}>영상이 없습니다.</li>}
        {c.rows.map((video) => (
          <VideoRow key={video.videoId} video={video} pinned={c.isPinned(video.videoId)} excluded={c.isExcluded(video.videoId)}
            busy={c.busy} onPin={() => c.togglePin(video.videoId)} onExclude={() => c.toggleExclude(video.videoId)} />
        ))}
      </ul>

      <p className={styles.footnote}>
        쇼핑몰에는 고정 영상 → 검색 결과 순으로 보이고, 제외한 영상은 빠집니다. (현재 노출 {v.displayed.length}개)
      </p>
    </div>
  );
}
