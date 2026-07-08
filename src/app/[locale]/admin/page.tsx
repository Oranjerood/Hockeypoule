"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trophy, Shield, CalendarDays, Sliders, Users, ListTree, Building2, Award, Gift } from "lucide-react";
import RequireAdmin from "@/components/RequireAdmin";
import RulesTab from "@/components/pool/RulesTab";
import AdminMatchesTable from "@/components/admin/AdminMatchesTable";
import AdminPoolsTable from "@/components/admin/AdminPoolsTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminTeamsTable from "@/components/admin/AdminTeamsTable";
import AdminCompetitionsPanel from "@/components/admin/AdminCompetitionsPanel";
import AdminSportsTable from "@/components/admin/AdminSportsTable";
import AdminCompaniesTable from "@/components/admin/AdminCompaniesTable";
import AdminSponsorsTable from "@/components/admin/AdminSponsorsTable";
import AdminPrizesTable from "@/components/admin/AdminPrizesTable";
import { useAppStore } from "@/lib/store";

type Tab = "competitions" | "sports" | "teams" | "matches" | "points" | "users" | "pools" | "companies" | "sponsors" | "prizes";

function AdminContent() {
  const t = useTranslations("Admin");
  const [tab, setTab] = useState<Tab>("matches");
  const [poolIdForPoints, setPoolIdForPoints] = useState<string>("pool-national-women");

  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const users = useAppStore((s) => s.users);
  const matches = useAppStore((s) => s.matches);
  const teams = useAppStore((s) => s.teams);
  const sports = useAppStore((s) => s.sports);
  const competitions = useAppStore((s) => s.competitions);
  const companies = useAppStore((s) => s.companies);
  const competitionAccess = useAppStore((s) => s.competitionAccess);
  const sponsors = useAppStore((s) => s.sponsors);
  const prizes = useAppStore((s) => s.prizes);
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const updatePointsSettings = useAppStore((s) => s.updatePointsSettings);

  const tabs: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: "competitions", label: t("competitions"), icon: Trophy },
    { id: "sports", label: t("sports"), icon: ListTree },
    { id: "teams", label: t("teams"), icon: Shield },
    { id: "matches", label: t("matches"), icon: CalendarDays },
    { id: "points", label: t("pointsSystem"), icon: Sliders },
    { id: "companies", label: t("companies"), icon: Building2 },
    { id: "sponsors", label: t("sponsors"), icon: Award },
    { id: "prizes", label: t("prizes"), icon: Gift },
    { id: "users", label: t("users"), icon: Users },
    { id: "pools", label: t("pools"), icon: ListTree },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">
        Alleen zichtbaar voor beheerders. Wijzigingen hier werken direct door in alle poules.
      </p>

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
        {tab === "competitions" && <AdminCompetitionsPanel competitions={competitions} sports={sports} />}
        {tab === "sports" && <AdminSportsTable sports={sports} />}
        {tab === "teams" && <AdminTeamsTable teams={teams} />}
        {tab === "matches" && <AdminMatchesTable matches={matches} teams={teams} />}
        {tab === "points" && (
          <div className="space-y-4">
            <select
              value={poolIdForPoints}
              onChange={(e) => setPoolIdForPoints(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            >
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.name}
                </option>
              ))}
            </select>
            <RulesTab
              settings={getPointsSettings(poolIdForPoints)}
              isOwner
              onSave={(next) => updatePointsSettings(poolIdForPoints, next)}
            />
          </div>
        )}
        {tab === "companies" && (
          <AdminCompaniesTable companies={companies} competitionAccess={competitionAccess} />
        )}
        {tab === "sponsors" && <AdminSponsorsTable sponsors={sponsors} />}
        {tab === "prizes" && <AdminPrizesTable prizes={prizes} />}
        {tab === "users" && <AdminUsersTable users={users} />}
        {tab === "pools" && <AdminPoolsTable pools={pools} poolMembers={poolMembers} />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminContent />
    </RequireAdmin>
  );
}
