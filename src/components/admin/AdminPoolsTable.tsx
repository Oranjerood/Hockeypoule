"use client";

import { Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import Badge from "../ui/Badge";
import type { Pool, PoolMember } from "@/types";

export default function AdminPoolsTable({
  pools,
  poolMembers,
}: {
  pools: Pool[];
  poolMembers: PoolMember[];
}) {
  const deletePool = useAppStore((s) => s.deletePool);

  return (
    <div className="space-y-2">
      {pools.map((pool) => {
        const memberCount = poolMembers.filter((m) => m.poolId === pool.id).length;
        return (
          <div
            key={pool.id}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
          >
            <div>
              <p className="font-medium">{pool.name}</p>
              <p className="text-xs text-muted">
                {memberCount} deelnemers · code {pool.inviteCode}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {pool.isNational && <Badge tone="primary">Landelijk</Badge>}
              {!pool.isNational && (
                <button
                  onClick={() => {
                    if (confirm(`Poule "${pool.name}" verwijderen?`)) deletePool(pool.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-danger hover:bg-danger/10"
                  aria-label="Verwijderen"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
