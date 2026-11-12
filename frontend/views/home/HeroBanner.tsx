import { ButtonLink } from "@/views/ui/Button";
import styles from "./HeroBanner.module.css";

export default function HeroBanner({ title, tagline }: { title: string; tagline?: string }) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>{title}</h1>
      {tagline && <p className={styles.tagline}>{tagline}</p>}
      <div className={styles.action}>
        <ButtonLink href="/products" variant="outline" size="lg">
          전체 상품 보기
        </ButtonLink>
      </div>
    </section>
  );
}
