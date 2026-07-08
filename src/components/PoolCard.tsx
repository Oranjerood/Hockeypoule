"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Users, Crown, Trophy } from "lucide-react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import type { Pool } from "@/types";

export default function PoolCard({
  pool,
  memberCount,
  role,
  position,
}: {
  pool: Pool;
  memberCount: number;
  role: "owner" | "member";
  position?: number;
}) {
  const t = useTranslations("Dashboard");
  const c = useTranslations("Common");

  return (
    <Link href={`/pools/${pool.id}`}>
      <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Trophy size={22} />
          </div>
          {position && (
            <Badge tone="primary">#{position}</Badge>
          )}
        </div>
        <h3 className="mt-3 font-semibold leading-tight">{pool.name}</h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {pool.isNational && (
            <span className="text-xs font-medium text-primary">{c("officialPool")}</span>
          )}
          {pool.division && (
            <Badge tone="neutral">{pool.division === "women" ? c("women") : c("men")}</Badge>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Users size={14} /> {memberCount} {t("members")}
          </span>
          <span className="flex items-center gap-1">
            {role === "owner" && <Crown size={14} className="text-primary" />}
            {role === "owner" ? t("role_owner") : t("role_member")}
          </span>
        </div>
      </Card>
    </Link>
  );
}
