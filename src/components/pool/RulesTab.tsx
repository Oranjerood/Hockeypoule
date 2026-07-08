"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Label } from "../ui/Input";
import type { PointsSettings } from "@/types";

const FIELDS: { key: keyof PointsSettings; labelKey: string }[] = [
  { key: "exactScore", labelKey: "exactScore" },
  { key: "correctWinner", labelKey: "correctWinner" },
  { key: "correctDraw", labelKey: "correctDraw" },
  { key: "correctGoalDifference", labelKey: "correctGoalDiff" },
  { key: "champion", labelKey: "champion" },
  { key: "finalist", labelKey: "finalist" },
  { key: "topscorer", labelKey: "topscorer" },
  { key: "surpriseTeam", labelKey: "surpriseTeam" },
];

export default function RulesTab({
  settings,
  isOwner,
  onSave,
}: {
  settings: PointsSettings;
  isOwner: boolean;
  onSave: (settings: PointsSettings) => void;
}) {
  const t = useTranslations("PoolDetail");
  const c = useTranslations("Common");
  const [draft, setDraft] = useState(settings);
  const [editing, setEditing] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("pointsSystemTitle")}</h3>
        {isOwner && !editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            {c("save")} …
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
            <span className="text-sm text-muted">{t(field.labelKey as never)}</span>
            {editing ? (
              <input
                type="number"
                value={draft[field.key]}
                onChange={(e) =>
                  setDraft({ ...draft, [field.key]: Number(e.target.value) })
                }
                className="w-16 rounded-lg border border-border bg-surface px-2 py-1 text-right text-sm"
              />
            ) : (
              <span className="font-semibold">{settings[field.key]}</span>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => { setDraft(settings); setEditing(false); }}>
            {c("cancel")}
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              setEditing(false);
            }}
          >
            {c("save")}
          </Button>
        </div>
      )}
    </Card>
  );
}
