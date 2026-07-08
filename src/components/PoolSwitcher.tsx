"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowRightLeft } from "lucide-react";
import Button from "./ui/Button";
import { useAppStore } from "@/lib/store";
import { getPoolsForUser } from "@/lib/pool-helpers";

// Reusable "quick switch" between the pools a user belongs to, plus a
// virtual entry for the combined women+men overall standings (when the
// competition has both an official women's and men's pool).
export default function PoolSwitcher({ currentPoolId }: { currentPoolId?: string }) {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser());
  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const competitions = useAppStore((s) => s.competitions);

  const [selected, setSelected] = useState("");

  if (!currentUser) return null;

  const myPools = getPoolsForUser(pools, poolMembers, currentUser.id);

  // Competitions where the user is a member of both an official women's and
  // men's pool get a combined-standings shortcut.
  const combinedOptions = competitions.filter((competition) => {
    const womensPool = pools.find(
      (p) => p.competitionId === competition.id && p.isNational && p.division === "women"
    );
    const mensPool = pools.find(
      (p) => p.competitionId === competition.id && p.isNational && p.division === "men"
    );
    if (!womensPool || !mensPool) return false;
    const isMember = (poolId: string) =>
      poolMembers.some((m) => m.poolId === poolId && m.userId === currentUser.id);
    return isMember(womensPool.id) && isMember(mensPool.id);
  });

  if (myPools.length < 2 && combinedOptions.length === 0) return null;

  function handleGo() {
    if (!selected) return;
    if (selected.startsWith("combined:")) {
      router.push(`/competitions/${selected.replace("combined:", "")}`);
    } else {
      router.push(`/pools/${selected}`);
    }
  }

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ArrowRightLeft size={16} className="text-primary" />
        Snel wisselen tussen poules
      </div>
      <p className="mt-1 text-sm text-muted">
        Bekijk hoe je ervoor staat in een van je andere poules.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">Kies een poule...</option>
          {myPools
            .filter(({ pool }) => pool.id !== currentPoolId)
            .map(({ pool }) => (
              <option key={pool.id} value={pool.id}>
                {pool.name}
              </option>
            ))}
          {combinedOptions.map((competition) => (
            <option key={competition.id} value={`combined:${competition.id}`}>
              Totaalklassement — {competition.name} (dames + heren)
            </option>
          ))}
        </select>
        <Button size="sm" disabled={!selected} onClick={handleGo}>
          Bekijk
        </Button>
      </div>
    </div>
  );
}
