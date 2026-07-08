"use client";

import { useTranslations } from "next-intl";
import { teamName } from "@/lib/utils";
import { computeGroupStandings } from "@/lib/standings";
import type { Team, Match } from "@/types";

// Shared real tournament-group standings table (W/D/L/GD/Pts), used on both
// individual team pages and the public WK overview page.
export default function GroupStandingsTable({
  groupName,
  groupTeams,
  groupMatches,
  locale,
  highlightTeamId,
}: {
  groupName: string;
  groupTeams: Team[];
  groupMatches: Match[];
  locale: string;
  highlightTeamId?: string;
}) {
  const t = useTranslations("Team");
  const standings = computeGroupStandings(groupTeams.map((team) => team.id), groupMatches);

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {t("standings", { group: groupName })}
      </h4>
      <div className="mt-2 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[360px] text-sm">
          <thead>
            <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">{t("team")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("won")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("drawn")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("lost")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("goalDifference")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("points")}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const rowTeam = groupTeams.find((team) => team.id === row.teamId);
              return (
                <tr
                  key={row.teamId}
                  className={`border-b border-border last:border-0 ${
                    row.teamId === highlightTeamId ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {rowTeam?.flagEmoji} {rowTeam ? teamName(rowTeam, locale) : "?"}
                  </td>
                  <td className="px-2 py-2 text-right">{row.won}</td>
                  <td className="px-2 py-2 text-right">{row.drawn}</td>
                  <td className="px-2 py-2 text-right">{row.lost}</td>
                  <td className="px-2 py-2 text-right">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
