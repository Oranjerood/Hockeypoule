"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Trophy, Users, CalendarDays, ScrollText, BarChart3, MessageCircle } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LeaderboardTable from "@/components/pool/LeaderboardTable";
import ParticipantsTab from "@/components/pool/ParticipantsTab";
import MatchesTab from "@/components/pool/MatchesTab";
import RulesTab from "@/components/pool/RulesTab";
import StatsTab from "@/components/pool/StatsTab";
import ChatTab from "@/components/pool/ChatTab";
import { useAppStore } from "@/lib/store";
import PoolSwitcher from "@/components/PoolSwitcher";
import {
  getMembersForPool,
  getMatchesForCompetition,
  computePoolLeaderboard,
  hasCompetitionAccess,
} from "@/lib/pool-helpers";

type Tab = "leaderboard" | "participants" | "matches" | "rules" | "stats" | "chat";

function PoolDetailContent() {
  const params = useParams<{ poolId: string }>();
  const poolId = params.poolId;
  const t = useTranslations("PoolDetail");
  const c = useTranslations("Common");
  const tp = useTranslations("Pools");
  const locale = useLocale();

  const currentUser = useAppStore((s) => s.currentUser());
  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const users = useAppStore((s) => s.users);
  const predictions = useAppStore((s) => s.predictions);
  const specialPredictions = useAppStore((s) => s.specialPredictions);
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const updatePointsSettings = useAppStore((s) => s.updatePointsSettings);
  const joinPoolByCode = useAppStore((s) => s.joinPoolByCode);
  const allMatches = useAppStore((s) => s.matches);
  const competitions = useAppStore((s) => s.competitions);
  const competitionAccess = useAppStore((s) => s.competitionAccess);

  const [tab, setTab] = useState<Tab>("leaderboard");

  const pool = pools.find((p) => p.id === poolId);

  if (!pool || !currentUser) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted">{t("notFoundText")}</p>
        <Button href="/dashboard" className="mt-4">
          {c("backToDashboard")}
        </Button>
      </div>
    );
  }

  const members = getMembersForPool(poolMembers, pool.id);
  const isMember = members.some((m) => m.userId === currentUser.id);
  const myMembership = members.find((m) => m.userId === currentUser.id);
  const matches = getMatchesForCompetition(allMatches, pool.competitionId);
  const competition = competitions.find((comp) => comp.id === pool.competitionId);
  const settings = getPointsSettings(pool.id);

  const canAccess = competition ? hasCompetitionAccess(competition, competitionAccess, currentUser.id) : false;

  if (!isMember) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Trophy size={24} />
        </div>
        <h1 className="mt-4 text-xl font-bold">{pool.name}</h1>
        {canAccess ? (
          <>
            <p className="mt-2 text-sm text-muted">
              {t("notMemberYet")}
            </p>
            <Button className="mt-6" onClick={() => joinPoolByCode(pool.inviteCode)}>
              {t("joinNow")}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              {t("noAccessYet")}
            </p>
            <Button className="mt-6" href={`/competitions/${pool.competitionId}`}>
              {t("goToCompetition")}
            </Button>
          </>
        )}
      </div>
    );
  }

  const leaderboard = computePoolLeaderboard(
    pool,
    poolMembers,
    users,
    predictions,
    specialPredictions,
    settings,
    allMatches
  );

  const tabs: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: "leaderboard", label: t("tabLeaderboard"), icon: Trophy },
    { id: "participants", label: t("tabParticipants"), icon: Users },
    { id: "matches", label: t("tabMatches"), icon: CalendarDays },
    { id: "rules", label: t("tabRules"), icon: ScrollText },
    { id: "stats", label: t("tabStats"), icon: BarChart3 },
    ...(!pool.isNational ? [{ id: "chat" as Tab, label: c("chat"), icon: MessageCircle }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Trophy size={24} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{pool.name}</h1>
            {pool.division && (
              <Badge tone={pool.division === "women" ? "primary" : "neutral"} className="text-sm">
                {pool.division === "women" ? c("women") : c("men")}
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {pool.isNational && <Badge tone="primary">{c("officialPool")}</Badge>}
            {pool.isCompany && <Badge tone="primary">{c("companyPool")}</Badge>}
            <Badge tone="neutral">{pool.visibility === "public" ? tp("public") : tp("private")}</Badge>
            {myMembership?.role === "owner" && <Badge tone="primary">{c("owner")}</Badge>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <PoolSwitcher currentPoolId={pool.id} />
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-full bg-surface p-1 sm:inline-flex">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === tabItem.id
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <tabItem.icon size={15} />
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "leaderboard" && (
          <LeaderboardTable rows={leaderboard} currentUserId={currentUser.id} />
        )}
        {tab === "participants" && (
          <ParticipantsTab pool={pool} members={members} users={users} />
        )}
        {tab === "matches" && (
          <MatchesTab matches={matches} settings={settings} division={pool.division} />
        )}
        {tab === "rules" && (
          <RulesTab
            settings={settings}
            isOwner={myMembership?.role === "owner"}
            onSave={(next) => updatePointsSettings(pool.id, next)}
          />
        )}
        {tab === "stats" && (
          <StatsTab
            users={users.filter((u) => members.some((m) => m.userId === u.id))}
            matches={matches}
            predictions={predictions.filter((p) => matches.some((m) => m.id === p.matchId))}
            settings={settings}
            leaderboard={leaderboard}
            defaultUserId={currentUser.id}
            poolName={pool.name}
          />
        )}
        {tab === "chat" && !pool.isNational && (
          <ChatTab poolId={pool.id} members={users.filter((u) => members.some((m) => m.userId === u.id))} />
        )}
      </div>
    </div>
  );
}

export default function PoolDetailPage() {
  return (
    <RequireAuth>
      <PoolDetailContent />
    </RequireAuth>
  );
}
