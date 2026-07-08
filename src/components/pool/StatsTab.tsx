"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { buildUserStats } from "@/lib/scoring";
import { initials } from "@/lib/utils";
import type { Match, Prediction, PointsSettings, User, LeaderboardRow } from "@/types";

export default function StatsTab({
  users,
  matches,
  predictions,
  settings,
  leaderboard,
  defaultUserId,
  poolName,
}: {
  users: User[];
  matches: Match[];
  predictions: Prediction[];
  settings: PointsSettings;
  leaderboard: LeaderboardRow[];
  defaultUserId?: string;
  poolName: string;
}) {
  const t = useTranslations("PoolDetail");
  const [selectedUserId, setSelectedUserId] = useState(defaultUserId ?? users[0]?.id);

  const stats = useMemo(
    () => buildUserStats(selectedUserId ?? "", matches, predictions, settings),
    [selectedUserId, matches, predictions, settings]
  );

  function exportCsv() {
    const header = ["Positie", "Naam", "Punten", "Goed voorspeld", "Percentage"];
    const rows = leaderboard.map((r) => [r.position, r.name, r.points, r.correctPredictions, `${r.accuracy}%`]);
    const csv = [header, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${poolName.replace(/\s+/g, "-").toLowerCase()}-klassement.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download size={14} /> {t("exportExcel")}
        </Button>
      </div>

      {selectedUser && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{t("bestRound")}</p>
            <p className="mt-2 text-lg font-bold">{stats.bestRound?.round ?? "—"}</p>
            {stats.bestRound && <p className="text-sm text-success">+{stats.bestRound.points} pt</p>}
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{t("worstRound")}</p>
            <p className="mt-2 text-lg font-bold">{stats.worstRound?.round ?? "—"}</p>
            {stats.worstRound && <p className="text-sm text-muted">+{stats.worstRound.points} pt</p>}
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{t("exactScoresCount")}</p>
            <p className="mt-2 text-2xl font-bold">{stats.exactScoresCount}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{t("avgPoints")}</p>
            <p className="mt-2 text-2xl font-bold">{stats.averagePoints}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
