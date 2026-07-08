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
    topscorerNames?: string[];
  }) => void;
}) {
  const t = useTranslations("PoolDetail");
  const locale = useLocale();
  const [champion, setChampion] = useState(prediction?.championTeamId ?? "");
  const [finalistA, setFinalistA] = useState(prediction?.finalistTeamIds?.[0] ?? "");
  const [finalistB, setFinalistB] = useState(prediction?.finalistTeamIds?.[1] ?? "");
  const [topscorer1, setTopscorer1] = useState(prediction?.topscorerNames?.[0] ?? "");
  const [topscorer2, setTopscorer2] = useState(prediction?.topscorerNames?.[1] ?? "");
  const [topscorer3, setTopscorer3] = useState(prediction?.topscorerNames?.[2] ?? "");

  useEffect(() => {
    setChampion(prediction?.championTeamId ?? "");
    setFinalistA(prediction?.finalistTeamIds?.[0] ?? "");
    setFinalistB(prediction?.finalistTeamIds?.[1] ?? "");
    setTopscorer1(prediction?.topscorerNames?.[0] ?? "");
    setTopscorer2(prediction?.topscorerNames?.[1] ?? "");
    setTopscorer3(prediction?.topscorerNames?.[2] ?? "");
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

        <div className="sm:col-span-2">
          <Label>{t("topscorerPrediction")}</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              disabled={locked}
              value={topscorer1}
              onChange={(e) => setTopscorer1(e.target.value)}
              placeholder="1e keuze"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60"
            />
            <input
              disabled={locked}
              value={topscorer2}
              onChange={(e) => setTopscorer2(e.target.value)}
              placeholder="2e keuze"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60"
            />
            <input
              disabled={locked}
              value={topscorer3}
              onChange={(e) => setTopscorer3(e.target.value)}
              placeholder="3e keuze"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60"
            />
          </div>
        </div>

      </div>

      {!locked && (
        <Button
          className="mt-4"
          onClick={() =>
            onSave({
              championTeamId: champion || undefined,
              finalistTeamIds: finalistA && finalistB ? [finalistA, finalistB] : undefined,
              topscorerNames: [topscorer1, topscorer2, topscorer3].filter(Boolean),
            })
          }
        >
          {t("savePrediction")}
        </Button>
      )}
    </Card>
  );
}
