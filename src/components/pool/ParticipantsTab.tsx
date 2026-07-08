"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Crown, Copy, Check } from "lucide-react";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { initials } from "@/lib/utils";
import type { Pool, PoolMember, User } from "@/types";

export default function ParticipantsTab({
  pool,
  members,
  users,
}: {
  pool: Pool;
  members: PoolMember[];
  users: User[];
}) {
  const t = useTranslations("PoolDetail");
  const tp = useTranslations("Pools");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const rows = members
    .map((m) => {
      const user = users.find((u) => u.id === m.userId);
      return user ? { user, member: m } : null;
    })
    .filter((x): x is { user: User; member: PoolMember } => x !== null)
    .filter((x) => x.user.name.toLowerCase().includes(query.toLowerCase()));

  const inviteLink = `https://hockeypoule.app/join/${pool.inviteCode}`;

  return (
    <div className="space-y-6">
      {pool.visibility === "private" && (
        <Card className="p-5">
          <h3 className="font-semibold">{t("inviteParticipants")}</h3>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm">
              <span className="truncate text-muted">{inviteLink}</span>
              <Badge tone="primary" className="ml-2 shrink-0">
                {pool.inviteCode}
              </Badge>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(inviteLink).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-header px-4 py-2.5 text-sm font-medium text-white hover:brightness-125"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? tp("copied") : tp("copyLink")}
            </button>
          </div>
        </Card>
      )}

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          placeholder={t("searchParticipants")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(({ user, member }) => (
          <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{user.name}</p>
            </div>
            {member.role === "owner" && <Crown size={16} className="text-primary" />}
          </div>
        ))}
      </div>
    </div>
  );
}
