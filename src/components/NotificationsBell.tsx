"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";

// UI-only preview of the notifications feed. In production this would be
// backed by real events (match reminders, leaderboard changes, competition
// updates) delivered via Supabase + Web Push — see README "Volgende stappen".
export default function NotificationsBell() {
  const t = useTranslations("Common");
  const [open, setOpen] = useState(false);

  const items = [
    { title: "Halve finale begint over 2 uur", time: "Nu" },
    { title: "Je bent gestegen naar #2 in Kantoor WK Poule", time: "Gisteren" },
    { title: "Nieuwe uitslag: Nederland 4-0 Australië", time: "3 dagen geleden" },
  ];

  return (
    <div className="relative">
      <button
        aria-label={t("notifications")}
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Bell size={18} />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-surface p-2 text-foreground shadow-lg">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {t("notifications")}
            </p>
            {items.map((item) => (
              <div key={item.title} className="rounded-xl px-3 py-2 text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.06]">
                <p>{item.title}</p>
                <p className="mt-0.5 text-xs text-muted">{item.time}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
