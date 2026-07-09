"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { teamName } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Team } from "@/types";

function SquadEditor({ team }: { team: Team }) {
  const players = useAppStore((s) => s.players);
  const setSquad = useAppStore((s) => s.setSquad);
  const teamPlayers = players.filter((p) => p.teamId === team.id);
  const [draft, setDraft] = useState(teamPlayers.map((p) => p.name).join("\n"));
  const [saved, setSaved] = useState(false);

  return (
    <div className="mt-2 border-t border-border pt-2">
      <p className="text-xs text-muted">Eén spelernaam per regel. Dit vult de topscorer-keuzelijst.</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={5}
        placeholder={"Speler 1\nSpeler 2\nSpeler 3"}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() => {
            setSquad(
              team.id,
              draft.split(/\r?\n/).map((n) => n.trim()).filter(Boolean)
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
          className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:brightness-110"
        >
          Spelerslijst opslaan
        </button>
        {saved && <span className="text-xs text-success">✓ Opgeslagen</span>}
      </div>
    </div>
  );
}

export default function AdminTeamsTable({ teams }: { teams: Team[] }) {
  const locale = useLocale();
  const players = useAppStore((s) => s.players);
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => {
        const squadCount = players.filter((p) => p.teamId === team.id).length;
        const open = openTeamId === team.id;
        return (
          <div key={team.id} className="rounded-xl border border-border px-4 py-3">
            <button
              className="flex w-full items-center gap-3 text-left"
              onClick={() => setOpenTeamId(open ? null : team.id)}
            >
              <span className="text-2xl">{team.flagEmoji}</span>
              <div className="flex-1">
                <p className="font-medium">{teamName(team, locale)}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  {team.group}
                  <span className="ml-1 inline-flex items-center gap-1 text-primary">
                    <Users size={11} /> {squadCount}
                  </span>
                </p>
              </div>
              {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
            </button>
            {open && <SquadEditor team={team} />}
          </div>
        );
      })}
    </div>
  );
}
