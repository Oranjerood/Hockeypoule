"use client";

import { useTranslations } from "next-intl";
import RequireAuth from "@/components/RequireAuth";
import PoolCard from "@/components/PoolCard";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { getPoolsForUser, getMembersForPool, computePoolLeaderboard } from "@/lib/pool-helpers";
import { PlusCircle, UsersRound } from "lucide-react";

function DashboardContent() {
  const t = useTranslations("Dashboard");
  const currentUser = useAppStore((s) => s.currentUser());
  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const users = useAppStore((s) => s.users);
  const predictions = useAppStore((s) => s.predictions);
  const specialPredictions = useAppStore((s) => s.specialPredictions);
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const matches = useAppStore((s) => s.matches);

  if (!currentUser) return null;

  const myPools = getPoolsForUser(pools, poolMembers, currentUser.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button href="/pools/join" variant="outline">
            <UsersRound size={16} /> {t("joinExisting")}
          </Button>
          <Button href="/pools/create">
            <PlusCircle size={16} /> {t("createNew")}
          </Button>
        </div>
      </div>

      {myPools.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted">{t("noPools")}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myPools.map(({ pool, role }) => {
            const memberCount = getMembersForPool(poolMembers, pool.id).length;
            const settings = getPointsSettings(pool.id);
            const leaderboard = computePoolLeaderboard(
              pool,
              poolMembers,
              users,
              predictions,
              specialPredictions,
              settings,
              matches
            );
            const myRow = leaderboard.find((r) => r.userId === currentUser.id);
            return (
              <PoolCard
                key={pool.id}
                pool={pool}
                memberCount={memberCount}
                role={role}
                position={myRow?.position}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
