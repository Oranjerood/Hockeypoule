"use client";

import { useTranslations } from "next-intl";
import RequireAuth from "@/components/RequireAuth";
import MatchesTab from "@/components/pool/MatchesTab";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { hasCompetitionAccess, getMatchesForCompetition } from "@/lib/pool-helpers";
import { DEFAULT_POINTS_SETTINGS } from "@/lib/scoring";
import { getSport } from "@/data/mock-data";
import type { Division } from "@/types";

function PredictionsContent() {
  const t = useTranslations("Predictions");
  const c = useTranslations("Common");
  const currentUser = useAppStore((s) => s.currentUser());
  const competitions = useAppStore((s) => s.competitions);
  const competitionAccess = useAppStore((s) => s.competitionAccess);
  const teams = useAppStore((s) => s.teams);
  const matches = useAppStore((s) => s.matches);

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
          {myCompetitions.map((competition) => {
            const sport = getSport(competition.sportId);
            const hasDivisions = teams.some(
              (team) => team.competitionId === competition.id && team.division
            );
            const divisions: (Division | undefined)[] = hasDivisions ? ["women", "men"] : [undefined];

            return (
              <div key={competition.id}>
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <span className="text-2xl">{sport?.emoji}</span>
                  <h2 className="text-lg font-semibold">{competition.name}</h2>
                </div>
                <div className="mt-6 space-y-10">
                  {divisions.map((division) => {
                    const divisionMatches = getMatchesForCompetition(matches, competition.id, division);
                    if (divisionMatches.length === 0) return null;
                    return (
                      <div key={division ?? "all"}>
                        {division && (
                          <h3 className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                            {division === "women" ? c("women") : c("men")}
                          </h3>
                        )}
                        <MatchesTab
                          matches={divisionMatches}
                          settings={DEFAULT_POINTS_SETTINGS}
                          division={division}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
