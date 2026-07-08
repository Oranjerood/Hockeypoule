"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import RequireAuth from "@/components/RequireAuth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { hasCompetitionAccess } from "@/lib/pool-helpers";
import { Globe } from "lucide-react";

function JoinPoolContent() {
  const t = useTranslations("Pools");
  const searchParams = useSearchParams();
  const highlightCompetitionId = searchParams.get("competitionId");

  const currentUser = useAppStore((s) => s.currentUser());
  const pools = useAppStore((s) => s.pools);
  const competitions = useAppStore((s) => s.competitions);
  const competitionAccess = useAppStore((s) => s.competitionAccess);
  const joinPoolByCode = useAppStore((s) => s.joinPoolByCode);
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const publicPools = pools.filter((p) => p.visibility === "public");

  function handleJoinCode(e: React.FormEvent) {
    e.preventDefault();
    const pool = pools.find((p) => p.inviteCode.toLowerCase() === code.trim().toLowerCase());
    if (!pool) {
      setError("Geen poule gevonden met deze code.");
      return;
    }
    const competition = competitions.find((c) => c.id === pool.competitionId);
    if (competition && currentUser && !hasCompetitionAccess(competition, competitionAccess, currentUser.id)) {
      router.push(`/competitions/${competition.id}`);
      return;
    }
    joinPoolByCode(code);
    router.push(`/pools/${pool.id}`);
  }

  function handleJoinPublic(poolId: string, inviteCode: string, poolCompetitionId: string) {
    const competition = competitions.find((c) => c.id === poolCompetitionId);
    if (competition && currentUser && !hasCompetitionAccess(competition, competitionAccess, currentUser.id)) {
      router.push(`/competitions/${competition.id}`);
      return;
    }
    joinPoolByCode(inviteCode);
    router.push(`/pools/${poolId}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("joinTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("joinSubtitle")}</p>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold">{t("joinCode")}</h2>
        <form onSubmit={handleJoinCode} className="mt-3 space-y-3">
          <div>
            <Label htmlFor="code">{t("joinCode")}</Label>
            <Input
              id="code"
              placeholder="BIJV. KANTOOR8"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" fullWidth>
            {t("joinButton")}
          </Button>
        </form>
      </Card>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
          <Globe size={14} /> {t("browsePublic")}
        </h2>
        <div className="mt-3 space-y-2">
          {publicPools.map((pool) => (
            <button
              key={pool.id}
              onClick={() => handleJoinPublic(pool.id, pool.inviteCode, pool.competitionId)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm hover:border-primary ${
                pool.competitionId === highlightCompetitionId ? "border-primary" : "border-border"
              }`}
            >
              <span className="font-medium">{pool.name}</span>
              <Badge tone="neutral">{pool.inviteCode}</Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function JoinPoolPage() {
  return (
    <RequireAuth>
      <JoinPoolContent />
    </RequireAuth>
  );
}
