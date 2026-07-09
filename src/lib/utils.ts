import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function formatDateLong(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatCurrency(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const AVATAR_COLORS = ["#F97316", "#0EA5E9", "#22C55E", "#A855F7", "#EF4444", "#EAB308"];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function teamName(
  team: { name: string; nameEn?: string },
  locale: string
): string {
  return locale === "en" && team.nameEn ? team.nameEn : team.name;
}

// Accepts either a bare invite code (e.g. "KANTOOR8") or a full invite link
// (e.g. "https://hockeypoule.app/join/KANTOOR8") and returns just the code.
export function extractInviteCode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/").filter(Boolean);
      return parts[parts.length - 1];
    }
  } catch {
    // fall through
  }
  return trimmed;
}

// National pool names are stored as fixed Dutch strings in the demo data
// (e.g. "Officiële Poule — Vrouwen WK"), so they'd show up untranslated on
// the English site. For national pools, compute a locale-aware label from
// translated building blocks instead of trusting the stored name; custom/
// company pools keep whatever name their creator gave them.
export function poolDisplayName(
  pool: { name: string; isNational?: boolean; division?: "women" | "men" },
  labels: { official: string; women: string; men: string }
): string {
  if (!pool.isNational) return pool.name;
  const divisionLabel = pool.division === "women" ? labels.women : pool.division === "men" ? labels.men : "";
  return divisionLabel ? `${labels.official} — ${divisionLabel}` : labels.official;
}
