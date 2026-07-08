"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Users, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store";
import { formatDateLong } from "@/lib/utils";
import type { Team, Match } from "@/types";

function TeamMatchRow({ match, team, allTeams }: { match: Match; team: Team; allTeams: Team[] }) {
  const locale = useLocale();
  const isHome = match.homeTeamId === team.id;
  const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
  const opponent = allTeams.find((t) => t.id === opponentId);

  const statusTone =
    match.status === "finished" ? "neutral" : match.status === "live" ? "danger" : "primary";
  const statusLabel =
    match.status === "finished" ? "Afgelopen" : match.status === "live" ? "Bezig" : "Nog te spelen";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {opponent ? `${opponent.flagEmoji} ${opponent.name}` : "TBD"}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          {formatDateLong(match.date, locale)} · {match.time}
          <MapPin size={11} className="ml-1" /> {match.location}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {match.status !== "upcoming" && (
          <span className="rounded-lg bg-background px-2.5 py-1 text-sm font-bold tabular-nums">
            {isHome ? match.homeScore ?? 0 : match.awayScore ?? 0} -{" "}
            {isHome ? match.awayScore ?? 0 : match.homeScore ?? 0}
          </span>
        )}
        <Badge tone={statusTone}>{statusLabel}</Badge>
      </div>
    </div>
  );
}

function TeamDivisionSection({ team, allTeams, matches }: { team: Team; allTeams: Team[]; matches: Match[] }) {
  const teamMatches = matches
    .filter((m) => m.homeTeamId === team.id || m.awayTeamId === team.id)
    .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {team.division === "women" ? "Vrouwen" : team.division === "men" ? "Mannen" : "Wedstrijden"}
      </h3>
      <div className="mt-3 space-y-2">
        {teamMatches.length === 0 ? (
          <p className="text-sm text-muted">Nog geen wedstrijden bekend.</p>
        ) : (
          teamMatches.map((match) => (
            <TeamMatchRow key={match.id} match={match} team={team} allTeams={allTeams} />
          ))
        )}
      </div>
    </div>
  );
}

function TeamPageContent() {
  const params = useParams<{ teamId: string }>();
  const teams = useAppStore((s) => s.teams);
  const matches = useAppStore((s) => s.matches);

  const team = teams.find((t) => t.id === params.teamId);

  if (!team) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted">Team niet gevonden.</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          Terug naar de homepage
        </Link>
      </div>
    );
  }

  // Same country, same competition, across divisions (e.g. Netherlands
  // Women + Netherlands Men) collapse into one team page.
  const siblingTeams = teams.filter(
    (t) => t.competitionId === team.competitionId && t.country === team.country
  );
  const orderedTeams = [...siblingTeams].sort((a, b) => (a.division ?? "").localeCompare(b.division ?? ""));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Terug
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
          {team.flagEmoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{team.country}</h1>
          <p className="text-sm text-muted">FIH Hockey World Cup 2026</p>
        </div>
      </div>

      {orderedTeams.length > 1 ? (
        <div className="mt-2">
          {orderedTeams.map((t) => (
            <TeamDivisionSection key={t.id} team={t} allTeams={teams} matches={matches} />
          ))}
        </div>
      ) : (
        <TeamDivisionSection team={team} allTeams={teams} matches={matches} />
      )}

      <Card className="mt-8 p-6">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h2 className="font-semibold">Spelerslijst</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Binnenkort beschikbaar — hier komt de volledige selectie per team te staan zodra deze bekend is.
        </p>
      </Card>
    </div>
  );
}

export default function TeamPage() {
  return <TeamPageContent />;
}
