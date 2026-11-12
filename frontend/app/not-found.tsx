import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import StatusScreen from "@/views/system/StatusScreen";
import { ButtonLink } from "@/views/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.system.notFoundTitle, robots: { index: false } };
}

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <StatusScreen
      code="404"
      title={t.system.notFoundTitle}
      body={t.system.notFoundBody}
      actions={
        <>
          <ButtonLink href="/products">{t.home.browseAll}</ButtonLink>
          <ButtonLink href="/" variant="outline">{t.system.home}</ButtonLink>
        </>
      }
    />
  );
}
