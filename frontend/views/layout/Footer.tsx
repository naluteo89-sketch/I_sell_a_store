import type { Brand } from "@/models/types";
import styles from "./Footer.module.css";

export default function Footer({ brand }: { brand: Brand }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.name}>{brand.name}</p>
        {brand.businessInfo && <p>{brand.businessInfo}</p>}
        <p>
          고객센터 {brand.phone} · {brand.email}
        </p>
      </div>
    </footer>
  );
}
