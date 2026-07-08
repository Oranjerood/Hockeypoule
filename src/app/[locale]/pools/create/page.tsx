"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import RequireAuth from "@/components/RequireAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { hasCompetitionAccess } from "@/lib/pool-helpers";
import { Upload } from "lucide-react";

function CreatePoolContent() {
  const t = useTranslations("Pools");
  const tc = useTranslations("Common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const competitionId = searchParams.get("competitionId") ?? "";

  const currentUser = useAppStore((s) => s.currentUser());
  const competitions = useAppStore((s) => s.competitions);
  const competitionAccess = useAppStore((s) => s.competitionAccess);
  const teams = useAppStore((s) => s.teams);
  const createPool = useAppStore((s) => s.createPool);

  const competition = competitions.find((comp) => comp.id === competitionId);
  const canAccess =
    competition && currentUser
      ? hasCompetitionAccess(competition, competitionAccess, currentUser.id)
      : false;

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | undefined>();
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [division, setDivision] = useState<"women" | "men" | "">("");

  const hasDivisions = teams.some(
    (team) => team.competitionId === competitionId && team.division
  );

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleCreate() {
    const pool = createPool({
      name,
      competitionId,
      visibility,
      division: division || undefined,
      logoUrl: logoPreview,
    });
    router.push(`/pools/${pool.id}`);
  }

  if (!competition) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted">Kies eerst een competitie om een poule voor te maken.</p>
        <Button href="/dashboard" className="mt-4">
          Terug naar dashboard
        </Button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">{t("needsAccessTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("needsAccessText")}</p>
        <Button className="mt-6" href={`/competitions/${competition.id}`}>
          {t("goToCompetition")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("createTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{competition.name}</p>

      <div className="mt-6 flex items-center gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      <Card className="mt-6 p-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("createStep1")}
            </h2>
            <div>
              <Label htmlFor="poolName">{t("poolName")}</Label>
              <Input
                id="poolName"
                placeholder={t("poolNamePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>{t("competition")}</Label>
              <div className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm">
                {competition.name}
              </div>
            </div>
            <div>
              <Label>{t("logo")}</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted hover:border-primary hover:text-primary">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="logo" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <Upload size={18} />
                )}
                {t("uploadLogo")}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
            {hasDivisions && (
              <div>
                <Label>Voor wie voorspel je?</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setDivision("women")}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      division === "women" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <span className="font-semibold">Vrouwen</span>
                  </button>
                  <button
                    onClick={() => setDivision("men")}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      division === "men" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <span className="font-semibold">Mannen</span>
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Deze poule voorspelt alleen dit toernooi — maak een tweede poule als je ook de andere wilt spelen.
                </p>
              </div>
            )}
            <Button
              fullWidth
              size="lg"
              disabled={!name || (hasDivisions && !division)}
              onClick={() => setStep(2)}
            >
              {tc("next")}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("createStep2")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setVisibility("public")}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  visibility === "public" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <span className="font-semibold">{t("public")}</span>
                <p className="mt-1 text-sm text-muted">{t("publicText")}</p>
              </button>
              <button
                onClick={() => setVisibility("private")}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  visibility === "private" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <span className="font-semibold">{t("private")}</span>
                <p className="mt-1 text-sm text-muted">{t("privateText")}</p>
              </button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                {tc("back")}
              </Button>
              <Button fullWidth onClick={handleCreate}>
                {t("createButton")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function CreatePoolPage() {
  return (
    <RequireAuth>
      <CreatePoolContent />
    </RequireAuth>
  );
}
