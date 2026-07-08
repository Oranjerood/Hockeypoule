"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Users, MapPin, ArrowLeft, Crown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store";
import { formatDateLong, teamName } from "@/lib/utils";
import { computeCountryLeaderboard } from "@/lib/pool-helpers";
import { isPredictionLocked, scoreMatchPrediction, DEFAULT_POINTS_SETTINGS } from "@/lib/scoring";
import Button from "@/components/ui/Button";
import SharedGroupStandingsTable from "@/components/GroupStandingsTable";
import type { Team, Match } from "@/types";

function TeamMatchRow({ match, team, allTeams }: { match: Match; team: Team; allTeams: Team[] }) {
  const locale = useLocale();
  const t = useTranslations("Team");
  const tp = useTranslations("PoolDetail");
  const currentUser = useAppStore((s) => s.currentUser());
  const predictions = useAppStore((s) => s.predictions);
  const setMatchPrediction = useAppStore((s) => s.setMatchPrediction);

  const isHome = match.homeTeamId === team.id;
  const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
  const opponent = allTeams.find((t) => t.id === opponentId);

  const statusTone =
    match.status === "finished" ? "neutral" : match.status === "live" ? "danger" : "primary";
  const statusLabel =
    match.status === "finished" ? t("statusFinished") : match.status === "live" ? t("statusLive") : t("statusUpcoming");

  const prediction = predictions.find((p) => p.matchId === match.id && p.userId === currentUser?.id);
  const locked = isPredictionLocked(match);
  const points =
    match.status === "finished" ? scoreMatchPrediction(match, prediction, DEFAULT_POINTS_SETTINGS) : null;

  const [myScore, setMyScore] = useState((isHome ? prediction?.homeScore : prediction?.awayScore) ?? 0);
  const [oppScore, setOppScore] = useState((isHome ? prediction?.awayScore : prediction?.homeScore) ?? 0);

  useEffect(() => {
    setMyScore((isHome ? prediction?.homeScore : prediction?.awayScore) ?? 0);
    setOppScore((isHome ? prediction?.awayScore : prediction?.homeScore) ?? 0);
  }, [prediction?.homeScore, prediction?.awayScore, isHome]);

  function handleSave() {
    if (isHome) {
      setMatchPrediction(match.id, myScore, oppScore);
    } else {
      setMatchPrediction(match.id, oppScore, myScore);
    }
  }

  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {opponent ? `${opponent.flagEmoji} ${teamName(opponent, locale)}` : "TBD"}
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

      {!locked && currentUser && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-xs font-medium">{tp("predictScore")}:</span>
          <input
            type="number"
            min={0}
            max={20}
            value={myScore}
            onChange={(e) => setMyScore(Number(e.target.value))}
            className="w-12 rounded-lg border border-border bg-surface px-2 py-1 text-center text-sm"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            min={0}
            max={20}
            value={oppScore}
            onChange={(e) => setOppScore(Number(e.target.value))}
            className="w-12 rounded-lg border border-border bg-surface px-2 py-1 text-center text-sm"
          />
          <button
            onClick={handleSave}
            className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:brightness-110"
          >
            {tp("savePrediction")}
          </button>
        </div>
      )}
      {!locked && !currentUser && (
        <p className="mt-2 border-t border-border pt-2 text-xs text-muted">
          <Link href="/login" className="text-primary hover:underline">
            {t("kingQueenLoginCta")}
          </Link>
        </p>
      )}
      {locked && prediction && (
        <p className="mt-2 border-t border-border pt-2 text-xs text-muted">
          {tp("yourPrediction")}: {myScore}-{oppScore}
          {points !== null && ` · +${points} pt`}
        </p>
      )}
    </div>
  );
}

function GroupStandingsTable({ team, allTeams, matches, locale }: { team: Team; allTeams: Team[]; matches: Match[]; locale: string }) {
  if (!team.group) return null;

  const groupTeams = allTeams.filter(
    (t) => t.competitionId === team.competitionId && t.division === team.division && t.group === team.group
  );
  const groupMatches = matches.filter(
    (m) => m.competitionId === team.competitionId && m.division === team.division && m.group === team.group
  );

  return (
    <SharedGroupStandingsTable
      groupName={team.group}
      groupTeams={groupTeams}
      groupMatches={groupMatches}
      locale={locale}
      highlightTeamId={team.id}
    />
  );
}

function CountryFollowCard({ team, teamMatches }: { team: Team; teamMatches: Match[] }) {
  const locale = useLocale();
  const t = useTranslations("Team");
  const currentUser = useAppStore((s) => s.currentUser());
  const countryFollows = useAppStore((s) => s.countryFollows);
  const users = useAppStore((s) => s.users);
  const predictions = useAppStore((s) => s.predictions);
  const followCountry = useAppStore((s) => s.followCountry);
  const unfollowCountry = useAppStore((s) => s.unfollowCountry);

  const leaderboard = computeCountryLeaderboard(
    team.id,
    team.competitionId,
    teamMatches,
    predictions,
    users,
    countryFollows
  );
  const myFollow = currentUser
    ? countryFollows.find((f) => f.userId === currentUser.id && f.competitionId === team.competitionId)
    : undefined;
  const isFollowingThisTeam = myFollow?.teamId === team.id;
  const name = teamName(team, locale);

  return (
    <Card className="mt-4 p-5">
      <div className="flex items-center gap-2">
        <Crown size={17} className="text-primary" />
        <h4 className="font-semibold">{t("kingQueenTitle", { team: name })}</h4>
      </div>
      <p className="mt-1 text-sm text-muted">{t("kingQueenText", { team: name })}</p>

      <div className="mt-3">
        {!currentUser ? (
          <Button href="/login" variant="outline" size="sm">
            {t("kingQueenLoginCta")}
          </Button>
        ) : isFollowingThisTeam ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{t("kingQueenFollowing")}</Badge>
            <Button size="sm" variant="outline" onClick={() => unfollowCountry(team.competitionId)}>
              {t("kingQueenUnfollow")}
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => followCountry(team.competitionId, team.id)}>
            {t("kingQueenFollowButton")}
          </Button>
        )}
        {currentUser && myFollow && !isFollowingThisTeam && (
          <p className="mt-2 text-xs text-muted">{t("kingQueenSwitchNote")}</p>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <h5 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("kingQueenLeaderboard")}
        </h5>
        {leaderboard.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{t("kingQueenEmpty")}</p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {leaderboard.slice(0, 5).map((row) => (
              <div
                key={row.userId}
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
                  row.userId === currentUser?.id ? "bg-primary/5" : ""
                }`}
              >
                <span>
                  {row.position}. {row.name}
                </span>
                <span className="font-semibold">{row.points} pt</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function TeamDivisionSection({ team, allTeams, matches }: { team: Team; allTeams: Team[]; matches: Match[] }) {
  const locale = useLocale();
  const t = useTranslations("Team");
  const c = useTranslations("Common");
  const teamMatches = matches
    .filter((m) => m.homeTeamId === team.id || m.awayTeamId === team.id)
    .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {team.division === "women" ? c("women") : team.division === "men" ? c("men") : t("matches")}
      </h3>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {teamMatches.length === 0 ? (
            <p className="text-sm text-muted">{t("noMatchesYet")}</p>
          ) : (
            teamMatches.map((match) => (
              <TeamMatchRow key={match.id} match={match} team={team} allTeams={allTeams} />
            ))
          )}
        </div>
        <GroupStandingsTable team={team} allTeams={allTeams} matches={matches} locale={locale} />
      </div>
      <CountryFollowCard team={team} teamMatches={teamMatches} />
    </div>
  );
}

function TeamPageContent() {
  const params = useParams<{ teamId: string }>();
  const locale = useLocale();
  const t = useTranslations("Team");
  const teams = useAppStore((s) => s.teams);
  const matches = useAppStore((s) => s.matches);

  const team = teams.find((t) => t.id === params.teamId);

  if (!team) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted">{t("notFound")}</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          {t("backToHome")}
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
        <ArrowLeft size={14} /> {t("back")}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
          {team.flagEmoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{teamName(team, locale)}</h1>
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
          <h2 className="font-semibold">{t("squad")}</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          {t("squadComingSoon")}
        </p>
      </Card>
    </div>
  );
}

export default function TeamPage() {
  return <TeamPageContent />;
}
