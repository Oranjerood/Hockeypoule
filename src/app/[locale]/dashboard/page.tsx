"use client";

import { useTranslations, useLocale } from "next-intl";
import RequireAuth from "@/components/RequireAuth";
import PoolCard from "@/components/PoolCard";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { getPoolsForUser, getMembersForPool, computePoolLeaderboard, hasCompetitionAccess } from "@/lib/pool-helpers";
import { PlusCircle, UsersRound, Trophy, ArrowRight, Sparkles } from "lucide-react";
import PoolSwitcher from "@/components/PoolSwitcher";
import Card from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { getSport } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";

const WK_HOCKEY_ID = "comp-wk-hockey-2026";

function DashboardContent() {
  const t = useTranslations("Dashboard");
  const currentUser = useAppStore((s) => s.currentUser());
  const competitions = useAppStore((s) => s.competitions);
  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const users = useAppStore((s) => s.users);
  const predictions = useAppStore((s) => s.predictions);
  const specialPredictions = useAppStore((s) => s.specialPredictions);
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const matches = useAppStore((s) => s.matches);
  const competitionAccess = useAppStore((s) => s.competitionAccess);
  const locale = useLocale();

  if (!currentUser) return null;

  const myPools = getPoolsForUser(pools, poolMembers, currentUser.id);
  const nationalPools = myPools.filter(({ pool }) => pool.isNational);
  const ownPools = myPools.filter(({ pool }) => !pool.isNational);

  // Official, already-open competitions the user hasn't bought access to
  // yet - surfaced as an immediate "start & pay" option, most usefully
  // shown right away when the dashboard would otherwise be empty.
  const startableCompetitions = competitions.filter(
    (competition) =>
      competition.isOfficial &&
      !competition.comingSoon &&
      !hasCompetitionAccess(competition, competitionAccess, currentUser.id)
  );

  // Competitions where the user has both an official women's and men's pool
  // get a "combined standings" card next to those two.
  const combinedCompetitions = competitions.filter((competition) => {
    const inThisCompetition = nationalPools.filter(({ pool }) => pool.competitionId === competition.id);
    const hasWomen = inThisCompetition.some(({ pool }) => pool.division === "women");
    const hasMen = inThisCompetition.some(({ pool }) => pool.division === "men");
    return hasWomen && hasMen;
  });

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
          <Button href={{ pathname: "/pools/create", query: { competitionId: WK_HOCKEY_ID } }}>
            <PlusCircle size={16} /> {t("createNew")}
          </Button>
        </div>
      </div>

      {startableCompetitions.length > 0 && (
        <div className="mt-8">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted">
            <Sparkles size={14} className="text-primary" /> {t("startTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("startText")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {startableCompetitions.map((competition) => {
              const sport = getSport(competition.sportId);
              return (
                <Link key={competition.id} href={`/competitions/${competition.id}`}>
                  <Card className="flex h-full flex-col p-6 transition-shadow hover:shadow-md">
                    <span className="text-3xl">{sport?.emoji}</span>
                    <h3 className="mt-4 font-semibold">{competition.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {sport?.name} · {competition.season}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-6 text-sm">
                      <span className="font-medium text-primary">
                        {formatCurrency(competition.entryFeeCents, locale)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        {t("startButton")} <ArrowRight size={14} />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {myPools.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-10 text-center">
          <p className="text-muted">{t("noPools")}</p>
        </div>
      ) : (
        <>
          {nationalPools.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t("nationalPools")}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nationalPools.map(renderPoolCard)}
                {combinedCompetitions.map((competition) => (
                  <Link key={competition.id} href={`/competitions/${competition.id}`}>
                    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Trophy size={22} />
                      </div>
                      <h3 className="mt-3 font-semibold leading-tight">{t("overallCard")}</h3>
                      <p className="mt-0.5 text-xs font-medium text-primary">
                        {t("overallCardSubtitle")}
                      </p>
                      <p className="mt-auto pt-4 text-sm text-muted">{competition.name}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("ownPools")}
            </h2>
            {ownPools.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                {t("noOwnPools")}
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ownPools.map(renderPoolCard)}
              </div>
            )}
          </div>

          <div className="mt-10">
            <PoolSwitcher />
          </div>
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
