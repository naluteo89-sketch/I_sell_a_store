"use client";

import { useCommunityList } from "@/controllers/useCommunity";
import { useI18n } from "@/controllers/useI18n";
import { ButtonLink } from "@/views/ui/Button";
import Section from "@/views/ui/Section";
import PostCard from "./PostCard";
import styles from "./CommunityTeaser.module.css";

/** 홈 하단: 커뮤니티 최근 글 3개 */
export default function CommunityTeaser() {
  const { t } = useI18n();
  const { data } = useCommunityList({ page: 1, size: 3 });
  if (!data || data.items.length === 0) return null;
  return (
    <Section title={t.home.communityTitle} aside={<ButtonLink href="/community" variant="outline">{t.home.communityMore}</ButtonLink>}>
      <ul className={styles.grid}>
        {data.items.map((p) => (
          <li key={p.id}>
            <PostCard post={p} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
