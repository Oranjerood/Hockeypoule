"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import RequireAuth from "@/components/RequireAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { SPORTS } from "@/data/mock-data";
import { Plus, Trash2, Upload } from "lucide-react";

interface TeamDraft {
  name: string;
  country: string;
  flagEmoji: string;
}

function CreateCompetitionContent() {
  const tc = useTranslations("Common");
  const t = useTranslations("Competitions");
  const router = useRouter();
  const createCustomCompetition = useAppStore((s) => s.createCustomCompetition);

  const [step, setStep] = useState(1);

  // Step 1: basics
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState(SPORTS[0].id);
  const [customSport, setCustomSport] = useState("");
  const [season, setSeason] = useState(String(new Date().getFullYear()));

  // Step 2: teams
  const [teams, setTeams] = useState<TeamDraft[]>([
    { name: "", country: "", flagEmoji: "🏳️" },
    { name: "", country: "", flagEmoji: "🏳️" },
  ]);
  const [csvError, setCsvError] = useState("");

  // Step 3: format
  const [poolCount, setPoolCount] = useState(1);
  const [roundRobinType, setRoundRobinType] = useState<"single" | "double">("single");

  // Step 4: planning (optional)
  const [fillPlanning, setFillPlanning] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [location, setLocation] = useState("");

  function updateTeam(index: number, field: keyof TeamDraft, value: string) {
    setTeams((prev) => prev.map((team, i) => (i === index ? { ...team, [field]: value } : team)));
  }

  function addTeamRow() {
    setTeams((prev) => [...prev, { name: "", country: "", flagEmoji: "🏳️" }]);
  }

  function removeTeamRow(index: number) {
    setTeams((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const rows = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.split(","));
        const parsed: TeamDraft[] = rows.map(([teamName, country]) => ({
          name: (teamName ?? "").trim(),
          country: (country ?? "").trim() || "—",
          flagEmoji: "🏳️",
        }));
        if (parsed.length === 0) throw new Error("empty");
        setTeams(parsed);
        setCsvError("");
      } catch {
        setCsvError("Kon het bestand niet lezen. Gebruik het formaat: Teamnaam,Land per regel.");
      }
    };
    reader.readAsText(file);
  }

  const validTeamCount = teams.filter((team) => team.name.trim()).length;

  function handleSubmit() {
    const validTeams = teams.filter((team) => team.name.trim());
    const competition = createCustomCompetition({
      name,
      sportId,
      customSportName: sportId === "custom" ? customSport : undefined,
      season,
      teams: validTeams,
      poolCount,
      roundRobinType,
      startDate: fillPlanning && startDate ? startDate : undefined,
      startTime: fillPlanning && startTime ? startTime : undefined,
      location: fillPlanning ? location : undefined,
    });
    router.push(`/competitions/${competition.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("createCustomButton")}</h1>
      <p className="mt-1 text-sm text-muted">{t("createCustomText")}</p>

      <div className="mt-6 flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>

      <Card className="mt-6 space-y-5 p-6">
        {step === 1 && (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Basisgegevens</h2>
            <div>
              <Label>Naam van de competitie</Label>
              <Input
                placeholder="Bijv. Vriendengroep Padel Competitie"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Sport</Label>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                >
                  {SPORTS.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.emoji} {sport.name}
                    </option>
                  ))}
                  <option value="custom">Anders, namelijk...</option>
                </select>
                {sportId === "custom" && (
                  <Input
                    className="mt-2"
                    placeholder="Naam van de sport"
                    value={customSport}
                    onChange={(e) => setCustomSport(e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label>Seizoen</Label>
                <Input value={season} onChange={(e) => setSeason(e.target.value)} />
              </div>
            </div>

            <Button fullWidth size="lg" disabled={!name} onClick={() => setStep(2)}>
              {tc("next")}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Teams</h2>
            <div>
              <div className="flex items-center justify-between">
                <Label className="mb-0">Teams</Label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <Upload size={13} /> Upload CSV
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
                </label>
              </div>
              <p className="mt-1 text-xs text-muted">Formaat per regel: Teamnaam,Land — of voer teams hieronder handmatig in.</p>
              {csvError && <p className="mt-1 text-xs text-danger">{csvError}</p>}

              <div className="mt-3 space-y-2">
                {teams.map((team, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Teamnaam"
                      value={team.name}
                      onChange={(e) => updateTeam(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Land (optioneel)"
                      value={team.country}
                      onChange={(e) => updateTeam(index, "country", e.target.value)}
                      className="w-36"
                    />
                    <button
                      onClick={() => removeTeamRow(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger hover:bg-danger/10"
                      aria-label="Verwijder"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={addTeamRow}>
                <Plus size={14} /> Team toevoegen
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>{tc("back")}</Button>
              <Button fullWidth disabled={validTeamCount < 2} onClick={() => setStep(3)}>
                {tc("next")}
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Indeling</h2>
            <div>
              <Label>Speelt iedereen elkaar één keer of twee keer (thuis en uit)?</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setRoundRobinType("single")}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    roundRobinType === "single" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span className="font-semibold">Eén keer</span>
                  <p className="mt-1 text-sm text-muted">Elk team speelt één keer tegen elk ander team.</p>
                </button>
                <button
                  onClick={() => setRoundRobinType("double")}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    roundRobinType === "double" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span className="font-semibold">Twee keer (thuis/uit)</span>
                  <p className="mt-1 text-sm text-muted">Elk team speelt twee keer tegen elk ander team.</p>
                </button>
              </div>
            </div>

            <div>
              <Label>Hoeveel poules/groepen zijn er?</Label>
              <input
                type="number"
                min={1}
                max={8}
                value={poolCount}
                onChange={(e) => setPoolCount(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
              <p className="mt-1 text-xs text-muted">
                {poolCount > 1
                  ? `De ${validTeamCount} teams worden automatisch verdeeld over ${poolCount} poules.`
                  : "Alle teams spelen in één groep tegen elkaar."}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>{tc("back")}</Button>
              <Button fullWidth onClick={() => setStep(4)}>{tc("next")}</Button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Planning (optioneel)</h2>
            <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <input
                type="checkbox"
                checked={fillPlanning}
                onChange={(e) => setFillPlanning(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold">Nu al een datum, tijd en locatie invullen</span>
                <span className="block text-sm text-muted">
                  Geldt dan als standaard voor alle wedstrijden. Laat dit uit om het later per wedstrijd in
                  te vullen via het beheerpaneel.
                </span>
              </span>
            </label>

            {fillPlanning && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Startdatum</Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <Label>Tijd</Label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Locatie</Label>
                  <Input
                    placeholder="Bijv. Sportpark De Vlieger"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>{tc("back")}</Button>
              <Button fullWidth onClick={handleSubmit}>{t("createCustomButton")}</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function CreateCompetitionPage() {
  return (
    <RequireAuth>
      <CreateCompetitionContent />
    </RequireAuth>
  );
}
