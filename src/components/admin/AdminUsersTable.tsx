"use client";

import { useAppStore } from "@/lib/store";
import Badge from "../ui/Badge";
import { initials } from "@/lib/utils";
import type { User } from "@/types";

export default function AdminUsersTable({ users }: { users: User[] }) {
  const toggleUserAdmin = useAppStore((s) => s.toggleUserAdmin);

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {initials(user.name)}
            </span>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <button onClick={() => toggleUserAdmin(user.id)}>
            <Badge tone={user.isAdmin ? "primary" : "neutral"}>
              {user.isAdmin ? "Beheerder" : "Gebruiker"}
            </Badge>
          </button>
        </div>
      ))}
    </div>
  );
}
