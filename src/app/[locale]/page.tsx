import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Trophy, Target, TrendingUp, BarChart3, Zap, Sliders, Globe2, Building2, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { COMPETITIONS, TEAMS, getSport } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const t = useTranslations("Home");
  const c = useTranslations("Common");
  const tc = useTranslations("Competitions");

  const steps = [
    { icon: Target, title: t("step1Title"), text: t("step1Text") },
    { icon: TrendingUp, title: t("step2Title"), text: t("step2Text") },
    { icon: Trophy, title: t("step3Title"), text: t("step3Text") },
    { icon: BarChart3, title: t("step4Title"), text: t("step4Text") },
  ];

  const features = [
    { icon: Zap, title: t("featureLive"), text: t("featureLiveText") },
    { icon: Sliders, title: t("featureFlexible"), text: t("featureFlexibleText") },
    { icon: Globe2, title: t("featureMultiSport"), text: t("featureMultiSportText") },
    { icon: Building2, title: t("featureCompany"), text: t("featureCompanyText") },
  ];

  const featured = COMPETITIONS.find((comp) => comp.id === "comp-wk-hockey-2026")!;
  const officialCompetitions = COMPETITIONS.filter((comp) => comp.isOfficial);
  const featuredTeams = TEAMS.filter((team) => team.competitionId === featured.id).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-header text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Badge tone="primary" className="bg-white/10 text-white">
            <Trophy size={14} /> {t("tournamentBadge")}: {featured.name}
          </Badge>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`/competitions/${featured.id}`} size="lg">
              {t("ctaNational")}
            </Button>
            <Button href="/pools/join" variant="outline" size="lg" className="border-white/20 text-white">
              {t("ctaJoin")}
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {featuredTeams.map((team) => (
              <span
                key={team.id}
                className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/80"
              >
                <span className="text-base">{team.flagEmoji}</span> {team.country}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured + official competitions */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("officialTitle")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officialCompetitions.map((comp) => {
            const sport = getSport(comp.sportId);
            return (
              <Link key={comp.id} href={`/competitions/${comp.id}`}>
                <Card className="flex h-full flex-col p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{sport?.emoji}</span>
                    {comp.comingSoon ? (
                      <Badge tone="neutral">{c("comingSoon")}</Badge>
                    ) : (
                      <Badge tone="primary">{c("official")}</Badge>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold">{comp.name}</h3>
                  <p className="mt-1 text-sm text-muted">{sport?.name} · {comp.season}</p>
                  <div className="mt-auto flex items-center justify-between pt-6 text-sm">
                    <span className="font-medium text-primary">
                      {comp.entryFeeCents > 0 ? formatCurrency(comp.entryFeeCents, "nl") : "Gratis"}
                    </span>
                    <ArrowRight size={16} className="text-muted" />
                  </div>
                </Card>
              </Link>
            );
          })}

          <Link href="/competitions/create">
            <Card className="flex h-full flex-col items-start justify-center gap-2 border-dashed p-6 text-left transition-shadow hover:shadow-md">
              <Globe2 size={28} className="text-primary" />
              <h3 className="font-semibold">{tc("createCustom")}</h3>
              <p className="text-sm text-muted">{tc("createCustomText")}</p>
            </Card>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("howItWorksTitle")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Card key={step.title} className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon size={20} />
              </div>
              <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                {i + 1}
              </div>
              <h3 className="mt-1 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("featuresTitle")}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-start gap-6 bg-header p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">{t("ctaNational")}</h3>
            <p className="mt-1 text-white/70">{t("heroSubtitle")}</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button href="/register" size="lg">{c("register")}</Button>
            <Button href="/login" variant="outline" size="lg" className="border-white/20 text-white">
              {c("login")}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
