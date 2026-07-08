import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Trophy } from "lucide-react";

export default function Footer() {
  const t = useTranslations("Home");
  const c = useTranslations("Common");

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Trophy size={14} />
              </span>
              {c("appName")}
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted">{t("footerTagline")}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/" className="hover:text-foreground">{c("appName")}</Link>
            <Link href="/pools/join" className="hover:text-foreground">{t("ctaJoin")}</Link>
            <Link href="/competitions/comp-wk-hockey-2026" className="hover:text-foreground">{t("ctaCreate")}</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} {c("appName")} — Powered by Oranje-Rood Dames 1
        </p>
      </div>
    </footer>
  );
}
