"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import RequireAuth from "@/components/RequireAuth";
import PoolCard from "@/components/PoolCard";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { getPoolsForUser, getMembersForPool, computePoolLeaderboard } from "@/lib/pool-helpers";
import { PlusCircle, UsersRound, ArrowRightLeft } from "lucide-react";

const WK_HOCKEY_ID = "comp-wk-hockey-2026";

function DashboardContent() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser());
  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const users = useAppStore((s) => s.users);
  const predictions = useAppStore((s) => s.predictions);
  const specialPredictions = useAppStore((s) => s.specialPredictions);
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const matches = useAppStore((s) => s.matches);

  const [switchPoolId, setSwitchPoolId] = useState("");

  if (!currentUser) return null;

  const myPools = getPoolsForUser(pools, poolMembers, currentUser.id);
  const nationalPools = myPools.filter(({ pool }) => pool.isNational);
  const ownPools = myPools.filter(({ pool }) => !pool.isNational);

  function renderPoolCard({ pool, role }: { pool: (typeof myPools)[number]["pool"]; role: "owner" | "member" }) {
    const memberCount = getMembersForPool(poolMembers, pool.id).length;
    const settings = getPointsSettings(pool.id);
    const leaderboard = computePoolLeaderboard(
      pool, poolMembers, users, predictions, specialPredictions, settings, matches
    );
    const myRow = leaderboard.find((r) => r.userId === currentUser?.id);
    return (
      <PoolCard
        key={pool.id}
        pool={pool}
        memberCount={memberCount}
        role={role}
        position={myRow?.position}
      />
    );
  }

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
          <Button href={`/competitions/${WK_HOCKEY_ID}`}>
            <PlusCircle size={16} /> {t("createNew")}
          </Button>
        </div>
      </div>

      {myPools.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted">{t("noPools")}</p>
        </div>
      ) : (
        <>
          {nationalPools.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Landelijke poule(s)
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nationalPools.map(renderPoolCard)}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Jouw eigen poules
            </h2>
            {ownPools.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Je hebt nog geen eigen poule. Maak er een aan, of doe mee via een code.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ownPools.map(renderPoolCard)}
              </div>
            )}
          </div>

          {myPools.length > 1 && (
            <div className="mt-10 rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightLeft size={16} className="text-primary" />
                Snel wisselen tussen poules
              </div>
              <p className="mt-1 text-sm text-muted">
                Bekijk hoe je ervoor staat in een van je andere poules.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={switchPoolId}
                  onChange={(e) => setSwitchPoolId(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="">Kies een poule...</option>
                  {myPools.map(({ pool }) => (
                    <option key={pool.id} value={pool.id}>
                      {pool.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!switchPoolId}
                  onClick={() => switchPoolId && router.push(`/pools/${switchPoolId}`)}
                >
                  Bekijk poule
                </Button>
              </div>
            </div>
          )}
        </>
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
