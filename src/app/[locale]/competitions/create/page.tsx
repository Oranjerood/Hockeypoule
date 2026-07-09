"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import RequireAuth from "@/components/RequireAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { SPORTS } from "@/data/mock-data";
import { generateRoundRobinMatchups, defaultGroupAssignment, pairKey } from "@/lib/round-robin";
import { Plus, Trash2, Upload, Info } from "lucide-react";

interface TeamDraft {
  name: string;
  group?: string;
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

  // Step 2: teams (name only - these are club/company/friend teams, not
  // national teams, so there's no country/flag to fill in)
  const [teams, setTeams] = useState<TeamDraft[]>([{ name: "" }, { name: "" }]);
  const [csvError, setCsvError] = useState("");

  // Step 3: format + pool assignment + excluded matchups
  const [poolCount, setPoolCount] = useState(1);
  const [roundRobinType, setRoundRobinType] = useState<"single" | "double">("single");
  const [excludedKeys, setExcludedKeys] = useState<Set<string>>(new Set());

  // Step 4: planning (optional)
  const [fillPlanning, setFillPlanning] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [location, setLocation] = useState("");

  function updateTeamName(index: number, value: string) {
    setTeams((prev) => prev.map((team, i) => (i === index ? { ...team, name: value } : team)));
  }

  function updateTeamGroup(index: number, value: string) {
    setTeams((prev) => prev.map((team, i) => (i === index ? { ...team, group: value || undefined } : team)));
  }

  function addTeamRow() {
    setTeams((prev) => [...prev, { name: "" }]);
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
        const parsed: TeamDraft[] = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => ({ name: line.split(",")[0].trim() }))
          .filter((team) => team.name);
        if (parsed.length === 0) throw new Error("empty");
        setTeams(parsed);
        setCsvError("");
      } catch {
        setCsvError(t("csvError"));
      }
    };
    reader.readAsText(file);
  }

  const validTeamCount = teams.filter((team) => team.name.trim()).length;
  const validTeams = teams.filter((team) => team.name.trim());

  // Apply (or re-apply) a sensible default pool assignment whenever the
  // organizer changes the pool count - they can still override any team
  // individually afterwards.
  function applyDefaultGroups(nextPoolCount: number) {
    setPoolCount(nextPoolCount);
    const defaults = defaultGroupAssignment(teams.length, nextPoolCount);
    setTeams((prev) => prev.map((team, i) => ({ ...team, group: defaults[i] })));
  }

  const matchups = useMemo(
    () => generateRoundRobinMatchups(validTeams, roundRobinType),
    [validTeams, roundRobinType]
  );

  function toggleMatchup(key: string) {
    setExcludedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSubmit() {
    const competition = createCustomCompetition({
      name,
      sportId,
      customSportName: sportId === "custom" ? customSport : undefined,
      season,
      teams: validTeams,
      roundRobinType,
      excludedPairKeys: Array.from(excludedKeys),
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("stepBasics")}</h2>
            <div>
              <Label>{t("competitionName")}</Label>
              <Input
                placeholder={t("competitionNamePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("sport")}</Label>
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
                  <option value="custom">{t("sportOther")}</option>
                </select>
                {sportId === "custom" && (
                  <Input
                    className="mt-2"
                    placeholder={t("sportOtherPlaceholder")}
                    value={customSport}
                    onChange={(e) => setCustomSport(e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label>{t("season")}</Label>
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("stepTeams")}</h2>
            <div>
              <div className="flex items-center justify-between">
                <Label className="mb-0">{t("stepTeams")}</Label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <Upload size={13} /> {t("uploadCsv")}
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
                </label>
              </div>
              <p className="mt-1 text-xs text-muted">{t("csvFormatNote")}</p>
              {csvError && <p className="mt-1 text-xs text-danger">{csvError}</p>}

              <div className="mt-3 space-y-2">
                {teams.map((team, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={t("teamNamePlaceholder")}
                      value={team.name}
                      onChange={(e) => updateTeamName(index, e.target.value)}
                    />
                    <button
                      onClick={() => removeTeamRow(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger hover:bg-danger/10"
                      aria-label={t("removeTeam")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={addTeamRow}>
                <Plus size={14} /> {t("addTeam")}
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("stepFormat")}</h2>
            <div>
              <Label>{t("roundRobinQuestion")}</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setRoundRobinType("single")}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    roundRobinType === "single" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span className="font-semibold">{t("roundRobinOnce")}</span>
                  <p className="mt-1 text-sm text-muted">{t("roundRobinOnceText")}</p>
                </button>
                <button
                  onClick={() => setRoundRobinType("double")}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    roundRobinType === "double" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span className="font-semibold">{t("roundRobinTwice")}</span>
                  <p className="mt-1 text-sm text-muted">{t("roundRobinTwiceText")}</p>
                </button>
              </div>
            </div>

            <div>
              <Label>{t("poolCountQuestion")}</Label>
              <input
                type="number"
                min={1}
                max={8}
                value={poolCount}
                onChange={(e) => applyDefaultGroups(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </div>

            {poolCount > 1 && (
              <div>
                <Label>{t("manualGroupAssignment")}</Label>
                <p className="mb-2 text-xs text-muted">{t("manualGroupAssignmentText")}</p>
                <div className="space-y-2">
                  {validTeams.map((team, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 truncate text-sm">{team.name}</span>
                      <select
                        value={team.group ?? ""}
                        onChange={(e) => updateTeamGroup(teams.indexOf(team), e.target.value)}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
                      >
                        {Array.from({ length: poolCount }, (_, i) => `Poule ${"ABCDEFGH"[i]}`).map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchups.length > 0 && (
              <div>
                <Label>{t("matchupsPreview")}</Label>
                <p className="mb-2 flex items-start gap-1.5 text-xs text-muted">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  {t("matchupsPreviewText")}
                </p>
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                  {matchups.map((m, i) => {
                    const key = pairKey(m.teamAName, m.teamBName);
                    const excluded = excludedKeys.has(key);
                    return (
                      <label
                        key={`${key}-${m.leg}-${i}`}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                          excluded ? "opacity-40" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!excluded}
                          onChange={() => toggleMatchup(key)}
                        />
                        <span className="truncate">
                          {m.teamAName} — {m.teamBName}
                          {m.group ? ` (${m.group})` : ""}
                          {m.leg === 2 ? " ↩" : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>{tc("back")}</Button>
              <Button fullWidth onClick={() => setStep(4)}>{tc("next")}</Button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("stepPlanning")}</h2>
            <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <input
                type="checkbox"
                checked={fillPlanning}
                onChange={(e) => setFillPlanning(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold">{t("planningToggle")}</span>
                <span className="block text-sm text-muted">{t("planningToggleText")}</span>
              </span>
            </label>

            {fillPlanning && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("startDate")}</Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <Label>{t("startTime")}</Label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("location")}</Label>
                  <Input
                    placeholder={t("locationPlaceholder")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            )}

            <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">{t("customEntryFeeNote")}</p>

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
