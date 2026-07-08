"use client";

import { useLocale } from "next-intl";
import { teamName } from "@/lib/utils";
import type { Team } from "@/types";

export default function AdminTeamsTable({ teams }: { teams: Team[] }) {
  const locale = useLocale();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <div key={team.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
          <span className="text-2xl">{team.flagEmoji}</span>
          <div>
            <p className="font-medium">{teamName(team, locale)}</p>
            <p className="text-xs text-muted">{team.group}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
