"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarClock } from "lucide-react";
import MatchCard from "./MatchCard";
import SpecialPredictionsPanel from "./SpecialPredictionsPanel";
import { useAppStore } from "@/lib/store";
import type { Match, PointsSettings } from "@/types";

export default function MatchesTab({
  poolId,
  matches,
  settings,
}: {
  poolId: string;
  matches: Match[];
  settings: PointsSettings;
}) {
  const t = useTranslations("PoolDetail");
  const currentUser = useAppStore((s) => s.currentUser());
  const allTeams = useAppStore((s) => s.teams);
  const predictions = useAppStore((s) => s.predictions);
  const specialPredictions = useAppStore((s) => s.specialPredictions);
  const setMatchPrediction = useAppStore((s) => s.setMatchPrediction);
  const setSpecialPrediction = useAppStore((s) => s.setSpecialPrediction);

  const rounds = useMemo(() => Array.from(new Set(matches.map((m) => m.round))), [matches]);
  const groups = useMemo(
    () => Array.from(new Set(matches.map((m) => m.group).filter(Boolean))) as string[],
    [matches]
  );

  const [roundFilter, setRoundFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const filtered = matches.filter(
    (m) =>
      (roundFilter === "all" || m.round === roundFilter) &&
      (groupFilter === "all" || m.group === groupFilter)
  );

  const specialLocked = matches.some(
    (m) => !m.round.toLowerCase().includes("groepsfase") && m.status !== "upcoming"
  );

  const mySpecial = specialPredictions.find(
    (sp) => sp.poolId === poolId && sp.userId === currentUser?.id
  );

  const competitionId = matches[0]?.competitionId;
  const competitionTeams = allTeams.filter((team) => team.competitionId === competitionId);

  return (
    <div className="space-y-6">
      <SpecialPredictionsPanel
        teams={competitionTeams}
        prediction={mySpecial}
        locked={specialLocked || !currentUser}
        onSave={(data) => setSpecialPrediction(poolId, data)}
      />

      <div className="flex flex-wrap gap-3">
        <select
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="all">{t("allRounds")}</option>
          {rounds.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {groups.length > 0 && (
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="all">{t("allGroups")}</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((match) => {
          const prediction = predictions.find(
            (p) => p.matchId === match.id && p.userId === currentUser?.id
          );
          return (
            <MatchCard
              key={match.id}
              match={match}
              teams={competitionTeams}
              prediction={prediction}
              settings={settings}
              onSave={(homeScore, awayScore) =>
                setMatchPrediction(poolId, match.id, homeScore, awayScore)
              }
            />
          );
        })}
      </div>

      {competitionId === "comp-wk-hockey-2026" && (
        <div className="rounded-2xl border border-dashed border-border p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock size={16} className="text-primary" />
            Rest van het schema volgt
          </div>
          <p className="mt-2 text-sm text-muted">
            Hierboven staat de volledige groepsfase (Poule A t/m D). De kruisfinales (21-24 aug),
            plaatsingswedstrijden (27-28 aug) en halve finales, troostfinale en finale (29-30 aug)
            hangen af van de eindstand in de groepsfase — precies zoals bij het echte toernooi zijn de
            deelnemende teams daarvoor nog niet bekend. Zodra de groepsfase is afgerond voegen we deze
            wedstrijden hier automatisch toe, met dezelfde functionaliteit.
          </p>
        </div>
      )}
    </div>
  );
}
