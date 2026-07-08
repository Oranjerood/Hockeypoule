"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, ShieldCheck } from "lucide-react";
import Button from "./ui/Button";

// Mollie/iDEAL integration stub. In production this calls a server action
// that creates a Mollie payment (https://docs.mollie.com/) and redirects the
// user to the returned checkout URL. Here we simulate a successful payment
// after a short delay so the rest of the pool-creation flow can be tested.
export default function PaymentButton({
  amountLabel,
  onPaid,
}: {
  amountLabel: string;
  onPaid: () => void;
}) {
  const t = useTranslations("Pools");
  const [loading, setLoading] = useState<"ideal" | "card" | null>(null);

  function simulatePayment(method: "ideal" | "card") {
    setLoading(method);
    setTimeout(() => {
      setLoading(null);
      onPaid();
    }, 900);
  }

  return (
    <div className="space-y-3">
      <Button
        fullWidth
        size="lg"
        disabled={loading !== null}
        onClick={() => simulatePayment("ideal")}
      >
        {loading === "ideal" ? t("createButton") + "..." : `${t("payWithIdeal")} · ${amountLabel}`}
      </Button>
      <Button
        fullWidth
        variant="outline"
        disabled={loading !== null}
        onClick={() => simulatePayment("card")}
      >
        <CreditCard size={16} />
        {loading === "card" ? "..." : t("payWithCard")}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck size={14} /> {t("poweredByMollie")}
      </p>
    </div>
  );
}
