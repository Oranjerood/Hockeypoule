"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Crown } from "lucide-react";
import Input from "../ui/Input";
import { initials } from "@/lib/utils";
import type { LeaderboardRow } from "@/types";

export default function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId?: string;
}) {
  const t = useTranslations("PoolDetail");
  const c = useTranslations("Common");
  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          placeholder={t("searchParticipants")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">{t("position")}</th>
              <th className="px-4 py-3 font-medium">{t("participant")}</th>
              <th className="px-4 py-3 font-medium text-right">{c("points")}</th>
              <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">
                {t("correctPredictions")}
              </th>
              <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">
                {t("accuracy")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.userId}
                className={`border-b border-border last:border-0 ${
                  row.userId === currentUserId ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    {row.position === 1 && <Crown size={14} className="text-primary" />}
                    {row.position}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: row.avatarColor }}
                    >
                      {initials(row.name)}
                    </span>
                    {row.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{row.points}</td>
                <td className="hidden px-4 py-3 text-right text-muted sm:table-cell">
                  {row.correctPredictions}/{row.totalPredictions}
                </td>
                <td className="hidden px-4 py-3 text-right text-muted sm:table-cell">
                  {row.accuracy}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
