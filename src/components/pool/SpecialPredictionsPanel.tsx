"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Lock } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Label } from "../ui/Input";
import type { SpecialPrediction, Team } from "@/types";
import { teamName } from "@/lib/utils";

export default function SpecialPredictionsPanel({
  teams,
  prediction,
  locked,
  onSave,
}: {
  teams: Team[];
  prediction?: SpecialPrediction;
  locked: boolean;
  onSave: (data: {
    championTeamId?: string;
    finalistTeamIds?: string[];
    topscorerName?: string;
    surpriseTeamId?: string;
  }) => void;
}) {
  const t = useTranslations("PoolDetail");
  const locale = useLocale();
  const [champion, setChampion] = useState(prediction?.championTeamId ?? "");
  const [finalistA, setFinalistA] = useState(prediction?.finalistTeamIds?.[0] ?? "");
  const [finalistB, setFinalistB] = useState(prediction?.finalistTeamIds?.[1] ?? "");
  const [topscorer, setTopscorer] = useState(prediction?.topscorerName ?? "");

  useEffect(() => {
    setChampion(prediction?.championTeamId ?? "");
    setFinalistA(prediction?.finalistTeamIds?.[0] ?? "");
    setFinalistB(prediction?.finalistTeamIds?.[1] ?? "");
    setTopscorer(prediction?.topscorerName ?? "");
  }, [prediction]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("specialPredictions")}</h3>
        {locked && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Lock size={12} /> {t("locked")}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t("championPrediction")}</Label>
          <select
            disabled={locked}
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60"
          >
            <option value="">—</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.flagEmoji} {teamName(team, locale)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>{t("finalistsPrediction")}</Label>
          <div className="flex gap-2">
            <select
              disabled={locked}
              value={finalistA}
              onChange={(e) => setFinalistA(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60"
            >
              <option value="">—</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.flagEmoji} {teamName(team, locale)}
                </option>
              ))}
            </select>
            <select
              disabled={locked}
              value={finalistB}
              onChange={(e) => setFinalistB(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60"
            >
              <option value="">—</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.flagEmoji} {teamName(team, locale)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>{t("topscorerPrediction")}</Label>
          <input
            disabled={locked}
            value={topscorer}
            onChange={(e) => setTopscorer(e.target.value)}
            placeholder="Naam speler"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60"
          />
        </div>

      </div>

      {!locked && (
        <Button
          className="mt-4"
          onClick={() =>
            onSave({
              championTeamId: champion || undefined,
              finalistTeamIds: finalistA && finalistB ? [finalistA, finalistB] : undefined,
              topscorerName: topscorer || undefined,
            })
          }
        >
          {t("savePrediction")}
        </Button>
      )}
    </Card>
  );
}
