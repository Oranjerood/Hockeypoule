"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Lock, MapPin } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { formatDateLong, teamName } from "@/lib/utils";
import { isPredictionLocked, scoreMatchPrediction } from "@/lib/scoring";
import type { Match, Prediction, PointsSettings, Team } from "@/types";

export default function MatchCard({
  match,
  teams,
  prediction,
  settings,
  onSave,
}: {
  match: Match;
  teams: Team[];
  prediction?: Prediction;
  settings: PointsSettings;
  onSave: (homeScore: number, awayScore: number) => void;
}) {
  const t = useTranslations("PoolDetail");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const home = teams.find((team) => team.id === match.homeTeamId)!;
  const away = teams.find((team) => team.id === match.awayTeamId)!;
  const locked = isPredictionLocked(match);

  const [homeScore, setHomeScore] = useState(prediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(prediction?.awayScore ?? 0);

  useEffect(() => {
    setHomeScore(prediction?.homeScore ?? 0);
    setAwayScore(prediction?.awayScore ?? 0);
  }, [prediction?.homeScore, prediction?.awayScore]);

  const statusTone =
    match.status === "finished" ? "neutral" : match.status === "live" ? "danger" : "primary";
  const statusLabel =
    match.status === "finished"
      ? t("status_finished")
      : match.status === "live"
      ? t("status_live")
      : t("status_upcoming");

  const points = match.status === "finished" ? scoreMatchPrediction(match, prediction, settings) : null;

  return (
    <div className="rounded-2xl border border-border p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{formatDateLong(match.date, locale)} · {match.time}</span>
        <div className="flex items-center gap-1.5">
          {match.division && (
            <Badge tone={match.division === "women" ? "primary" : "neutral"}>
              {match.division === "women" ? tc("women") : tc("men")}
            </Badge>
          )}
          <Badge tone={statusTone}>{statusLabel}</Badge>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted">
        <MapPin size={12} /> {match.location} {match.group ? `· ${match.group}` : ""}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-2xl">{home.flagEmoji}</span>
          <span className="font-medium">{teamName(home, locale)}</span>
        </div>

        {match.status === "finished" || match.status === "live" ? (
          <div className="rounded-xl bg-background px-3 py-1.5 text-lg font-bold tabular-nums">
            {match.homeScore ?? 0} - {match.awayScore ?? 0}
          </div>
        ) : (
          <span className="text-sm font-medium text-muted">vs</span>
        )}

        <div className="flex flex-1 items-center justify-end gap-2 text-right">
          <span className="font-medium">{teamName(away, locale)}</span>
          <span className="text-2xl">{away.flagEmoji}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        {locked ? (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <Lock size={14} />
              {prediction
                ? `${t("yourPrediction")}: ${prediction.homeScore} - ${prediction.awayScore}`
                : t("locked")}
            </span>
            {points !== null && (
              <Badge tone={points > 0 ? "success" : "neutral"}>+{points} pt</Badge>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">{t("predictScore")}:</span>
            <input
              type="number"
              min={0}
              max={20}
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="w-14 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm"
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              min={0}
              max={20}
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="w-14 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm"
            />
            <Button size="sm" onClick={() => onSave(homeScore, awayScore)}>
              {t("savePrediction")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
