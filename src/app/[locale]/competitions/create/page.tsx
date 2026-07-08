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

  const [name, setName] = useState("");
  const [sportId, setSportId] = useState(SPORTS[0].id);
  const [customSport, setCustomSport] = useState("");
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [teams, setTeams] = useState<TeamDraft[]>([
    { name: "", country: "", flagEmoji: "🏳️" },
    { name: "", country: "", flagEmoji: "🏳️" },
  ]);
  const [csvError, setCsvError] = useState("");

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

  function handleSubmit() {
    const validTeams = teams.filter((team) => team.name.trim());
    const competition = createCustomCompetition({
      name,
      sportId,
      customSportName: sportId === "custom" ? customSport : undefined,
      season,
      teams: validTeams,
    });
    router.push(`/competitions/${competition.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("createCustomButton")}</h1>
      <p className="mt-1 text-sm text-muted">{t("createCustomText")}</p>

      <Card className="mt-6 space-y-5 p-6">
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

        <Button
          fullWidth
          size="lg"
          disabled={!name || teams.filter((t) => t.name.trim()).length < 2}
          onClick={handleSubmit}
        >
          {t("createCustomButton")}
        </Button>
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
