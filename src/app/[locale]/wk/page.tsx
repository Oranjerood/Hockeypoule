"use client";

import { useLocale, useTranslations } from "next-intl";
import { Trophy, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import GroupStandingsTable from "@/components/GroupStandingsTable";
import { useAppStore } from "@/lib/store";
import { teamName, formatDateLong } from "@/lib/utils";
import type { Division } from "@/types";

const WK_ID = "comp-wk-hockey-2026";

function DivisionSection({ division, label }: { division: Division; label: string }) {
  const locale = useLocale();
  const teams = useAppStore((s) => s.teams);
  const matches = useAppStore((s) => s.matches);

  const divisionTeams = teams.filter((t) => t.competitionId === WK_ID && t.division === division);
  const groups = Array.from(new Set(divisionTeams.map((t) => t.group).filter(Boolean))) as string[];

  return (
    <div className="mt-10">
      <h2 className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
        {label}
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {divisionTeams.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            <span className="text-base">{team.flagEmoji}</span> {teamName(team, locale)}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => {
          const groupTeams = divisionTeams.filter((t) => t.group === group);
          const groupMatches = matches.filter(
            (m) => m.competitionId === WK_ID && m.division === division && m.group === group
          );
          return (
            <GroupStandingsTable
              key={group}
              groupName={group}
              groupTeams={groupTeams}
              groupMatches={groupMatches}
              locale={locale}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function WkOverviewPage() {
  const t = useTranslations("WkOverview");
  const c = useTranslations("Common");
  const locale = useLocale();
  const competitions = useAppStore((s) => s.competitions);
  const competition = competitions.find((c) => c.id === WK_ID);

  if (!competition) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
          🏑
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{competition.name}</h1>
          <p className="text-sm text-muted">
            {formatDateLong(competition.startDate, locale)} – {formatDateLong(competition.endDate, locale)}
          </p>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-muted">{t("subtitle")}</p>

      <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl bg-header p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{t("ctaTitle")}</p>
          <p className="mt-1 text-sm text-white/70">{t("ctaText")}</p>
        </div>
        <Button href={`/competitions/${WK_ID}`} size="md" className="shrink-0">
          <Trophy size={16} /> {t("ctaButton")} <ArrowRight size={15} />
        </Button>
      </div>

      <DivisionSection division="women" label={c("women")} />
      <DivisionSection division="men" label={c("men")} />
    </div>
  );
}
