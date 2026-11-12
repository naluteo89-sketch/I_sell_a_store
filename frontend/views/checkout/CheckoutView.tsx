"use client";

import { useCheckout } from "@/controllers/useCheckout";
import { useI18n } from "@/controllers/useI18n";
import { useMounted } from "@/controllers/useMounted";
import { ButtonLink } from "@/views/ui/Button";
import EmptyState from "@/views/ui/EmptyState";
import CheckoutSummary from "./CheckoutSummary";
import PaymentMethodPicker from "./PaymentMethodPicker";
import ShippingForm from "./ShippingForm";
import styles from "./CheckoutView.module.css";

/** V — 주문서 (로직은 useCheckout) */
export default function CheckoutView() {
  const c = useCheckout();
  const mounted = useMounted();
  const { t } = useI18n();
  if (!mounted) return null;
  if (c.lines.length === 0) {
    return <EmptyState action={<ButtonLink href="/products">{t.cart.goShopping}</ButtonLink>}>{t.checkout.empty}</EmptyState>;
  }

  return (
    <form onSubmit={c.submit} className={styles.layout}>
      <div className={styles.main}>
        <h1 className={styles.title}>{t.checkout.title}</h1>
        <ShippingForm value={c.shipping} onChange={c.updateShipping} />
        <PaymentMethodPicker value={c.method} onChange={c.setMethod} />
      </div>
      <CheckoutSummary lines={c.lines} total={c.total} agree={c.agree} onAgree={c.setAgree} busy={c.busy} error={c.error} />
    </form>
  );
}
