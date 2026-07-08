"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import Button from "../ui/Button";
import type { Match, MatchStatus, Team } from "@/types";

function MatchRow({ match, teams }: { match: Match; teams: Team[] }) {
  const adminUpdateMatch = useAppStore((s) => s.adminUpdateMatch);
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [saved, setSaved] = useState(false);

  const home = teams.find((team) => team.id === match.homeTeamId);
  const away = teams.find((team) => team.id === match.awayTeamId);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2.5 text-xs text-muted whitespace-nowrap">{match.round}</td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        {home?.flagEmoji} {home?.name} - {away?.flagEmoji} {away?.name}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-12 rounded-lg border border-border bg-surface px-1.5 py-1 text-center text-sm"
          />
          <span>-</span>
          <input
            type="number"
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-12 rounded-lg border border-border bg-surface px-1.5 py-1 text-center text-sm"
          />
        </div>
      </td>
      <td className="px-3 py-2.5">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MatchStatus)}
          className="rounded-lg border border-border bg-surface px-2 py-1 text-sm"
        >
          <option value="upcoming">Nog te spelen</option>
          <option value="live">Bezig</option>
          <option value="finished">Afgelopen</option>
        </select>
      </td>
      <td className="px-3 py-2.5 text-right">
        <Button
          size="sm"
          variant={saved ? "outline" : "primary"}
          onClick={() => {
            adminUpdateMatch(match.id, { homeScore, awayScore, status });
            setSaved(true);
            setTimeout(() => setSaved(false), 1200);
          }}
        >
          {saved ? "✓ Opgeslagen" : "Opslaan"}
        </Button>
      </td>
    </tr>
  );
}

export default function AdminMatchesTable({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2.5 font-medium">Ronde</th>
            <th className="px-3 py-2.5 font-medium">Wedstrijd</th>
            <th className="px-3 py-2.5 font-medium">Uitslag</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium text-right">Actie</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} teams={teams} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
