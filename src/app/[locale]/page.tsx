import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Trophy, Zap, Sliders, Globe2, Building2, ArrowRight, KeyRound, Mail, Heart } from "lucide-react";
import {
  JoinPoolMockup,
  PredictScoreMockup,
  CollectPointsMockup,
  LeaderboardMockup,
} from "@/components/StepIllustrations";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { COMPETITIONS, TEAMS, getSport } from "@/data/mock-data";
import { formatCurrency, teamName } from "@/lib/utils";

export default function HomePage() {
  const t = useTranslations("Home");
  const c = useTranslations("Common");
  const tc = useTranslations("Competitions");
  const locale = useLocale();

  const steps = [
    { Illustration: JoinPoolMockup, title: t("step1Title"), text: t("step1Text") },
    { Illustration: PredictScoreMockup, title: t("step2Title"), text: t("step2Text") },
    { Illustration: CollectPointsMockup, title: t("step3Title"), text: t("step3Text") },
    { Illustration: LeaderboardMockup, title: t("step4Title"), text: t("step4Text") },
  ];

  const features = [
    { icon: Zap, title: t("featureLive"), text: t("featureLiveText") },
    { icon: Sliders, title: t("featureFlexible"), text: t("featureFlexibleText") },
    { icon: Building2, title: t("featureCompany"), text: t("featureCompanyText") },
    { icon: Globe2, title: t("featureMultiSport"), text: t("featureMultiSportText") },
  ];

  const featured = COMPETITIONS.find((comp) => comp.id === "comp-wk-hockey-2026")!;
  const officialCompetitions = COMPETITIONS.filter((comp) => comp.isOfficial);

  // One flag chip per country (women's + men's team collapse into one chip
  // that links to that country's combined team page).
  const wkTeams = TEAMS.filter((team) => team.competitionId === featured.id);
  const seenCountries = new Set<string>();
  const featuredTeams = wkTeams.filter((team) => {
    if (seenCountries.has(team.country)) return false;
    seenCountries.add(team.country);
    return true;
  }); // show every participating country, no cap

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
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={`/competitions/${featured.id}`} size="lg">
              <Trophy size={17} /> {t("ctaNational")}
            </Button>
            <Button href="/pools/join" variant="outline" size="lg" className="border-white/20 text-white">
              <KeyRound size={16} /> {t("ctaJoin")}
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {featuredTeams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="text-base">{team.flagEmoji}</span> {teamName(team, locale)}
              </Link>
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
                      {comp.comingSoon
                        ? c("comingSoon")
                        : comp.entryFeeCents > 0
                        ? formatCurrency(comp.entryFeeCents, locale)
                        : "Gratis"}
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
              <step.Illustration />
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

      {/* About */}
      <section id="over-ons" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-8">
            <h2 className="text-xl font-bold tracking-tight">{t("aboutTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("aboutText")}</p>
          </Card>
          <Card className="flex flex-col justify-center gap-3 p-8">
            <div className="flex items-center gap-2 font-semibold">
              <Heart size={18} className="text-primary" /> {t("aboutSponsorTitle")}
            </div>
            <p className="text-sm text-muted">{t("aboutSponsorText")}</p>
            <a
              href="mailto:hockeypoule@gmail.com"
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
            >
              <Mail size={15} /> hockeypoule@gmail.com
            </a>
          </Card>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-header p-8 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
        </div>
      </section>
    </div>
  );
}
