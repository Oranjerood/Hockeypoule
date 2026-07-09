"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import RequireAuth from "@/components/RequireAuth";
import MatchesTab from "@/components/pool/MatchesTab";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { hasCompetitionAccess, getMatchesForCompetition } from "@/lib/pool-helpers";
import { DEFAULT_POINTS_SETTINGS } from "@/lib/scoring";
import { getSport } from "@/data/mock-data";
import type { Competition, Division } from "@/types";

function CompetitionPredictions({ competition }: { competition: Competition }) {
  const c = useTranslations("Common");
  const t = useTranslations("Predictions");
  const teams = useAppStore((s) => s.teams);
  const matches = useAppStore((s) => s.matches);
  const sport = getSport(competition.sportId);

  const hasDivisions = teams.some(
    (team) => team.competitionId === competition.id && team.division
  );
  const divisions: (Division | undefined)[] = hasDivisions ? ["women", "men"] : [undefined];
  const [active, setActive] = useState<Division | undefined>(divisions[0]);

  const activeMatches = getMatchesForCompetition(matches, competition.id, active);

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="text-2xl">{sport?.emoji}</span>
        <h2 className="text-lg font-semibold">{competition.name}</h2>
      </div>

      {hasDivisions && (
        <>
          <div className="mt-4 inline-flex gap-1 rounded-full bg-surface p-1">
            {divisions.map((division) => (
              <button
                key={division}
                onClick={() => setActive(division)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active === division
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {division === "women" ? c("women") : c("men")}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-primary">
            {t("viewingSchedule", { division: active === "women" ? c("women") : c("men") })}
          </p>
        </>
      )}

      <div className="mt-6">
        {activeMatches.length === 0 ? (
          <p className="text-sm text-muted">—</p>
        ) : (
          <MatchesTab matches={activeMatches} settings={DEFAULT_POINTS_SETTINGS} division={active} />
        )}
      </div>
    </div>
  );
}

function PredictionsContent() {
  const t = useTranslations("Predictions");
  const currentUser = useAppStore((s) => s.currentUser());
  const competitions = useAppStore((s) => s.competitions);
  const competitionAccess = useAppStore((s) => s.competitionAccess);

  if (!currentUser) return null;

  const myCompetitions = competitions.filter(
    (competition) =>
      !competition.comingSoon &&
      hasCompetitionAccess(competition, competitionAccess, currentUser.id)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      {myCompetitions.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted">{t("noAccess")}</p>
          <Button href="/dashboard" className="mt-4">
            {t("browseCompetitions")}
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {myCompetitions.map((competition) => (
            <CompetitionPredictions key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <RequireAuth>
      <PredictionsContent />
    </RequireAuth>
  );
}
