"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import RequireAuth from "@/components/RequireAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { initials, formatDateLong } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { computeBadges } from "@/lib/achievements";
import { scoreMatchPrediction, DEFAULT_POINTS_SETTINGS } from "@/lib/scoring";
import { Trophy, Target, Flame, Sunrise, Crosshair, Award, Camera } from "lucide-react";

const BADGE_ICONS: Record<string, typeof Trophy> = {
  Trophy,
  Target,
  Flame,
  Sunrise,
  Crosshair,
};

function ProfileContent() {
  const t = useTranslations("Auth");
  const c = useTranslations("Common");
  const currentUser = useAppStore((s) => s.currentUser());
  const updateProfile = useAppStore((s) => s.updateProfile);
  const logout = useAppStore((s) => s.logout);
  const router = useRouter();
  const locale = useLocale();
  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const predictions = useAppStore((s) => s.predictions);
  const specialPredictions = useAppStore((s) => s.specialPredictions);
  const matches = useAppStore((s) => s.matches);
  const competitions = useAppStore((s) => s.competitions);
  const users = useAppStore((s) => s.users);
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const pf = useTranslations("Profile");
  const [name, setName] = useState(currentUser?.name ?? "");
  const [photo, setPhoto] = useState<string | undefined>(currentUser?.avatarPhotoUrl);
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const badges = computeBadges(currentUser.id, {
    pools,
    poolMembers,
    predictions,
    specialPredictions,
    matches,
    competitions,
    users,
    getPointsSettings,
  });

  const history = predictions
    .filter((p) => p.userId === currentUser.id)
    .map((p) => {
      const match = matches.find((m) => m.id === p.matchId);
      if (!match) return null;
      const relevantPool = pools.find(
        (pl) =>
          pl.competitionId === match.competitionId &&
          (pl.division === undefined || pl.division === match.division) &&
          poolMembers.some((m) => m.poolId === pl.id && m.userId === currentUser.id)
      );
      const settings = relevantPool ? getPointsSettings(relevantPool.id) : DEFAULT_POINTS_SETTINGS;
      const points = scoreMatchPrediction(match, p, settings);
      return { prediction: p, match, pool: relevantPool, points };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime())
    .slice(0, 15);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{c("profile")}</h1>
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-4">
          <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: currentUser.avatarColor }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={currentUser.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              initials(currentUser.name)
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={18} className="text-white" />
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPhoto(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <div>
            <p className="font-semibold">{currentUser.name}</p>
            <p className="text-sm text-muted">{currentUser.email}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile(name, photo);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">{c("save")}</Button>
            {saved && <span className="text-sm text-success">✓ Opgeslagen</span>}
          </div>
        </form>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Award size={18} className="text-primary" /> {pf("achievements")}
        </h2>
        {badges.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{pf("noBadgesYet")}</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.icon] ?? Award;
              return (
                <div key={badge.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{badge.title}</p>
                    <p className="text-xs text-muted">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold">{pf("history")}</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{pf("noHistoryYet")}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {history.map(({ prediction, match, pool, points }) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm"
              >
                <div>
                  <p>{match.round}{pool ? ` · ${pool.name}` : ""}</p>
                  <p className="text-xs text-muted">
                    {formatDateLong(match.date, locale)} — jouw voorspelling {prediction.homeScore}-{prediction.awayScore}
                    {match.status === "finished" && ` · uitslag ${match.homeScore}-${match.awayScore}`}
                  </p>
                </div>
                {match.status === "finished" && (
                  <span className={`font-semibold ${points > 0 ? "text-success" : "text-muted"}`}>
                    +{points}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button
        variant="outline"
        className="mt-6"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        {c("logout")}
      </Button>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
