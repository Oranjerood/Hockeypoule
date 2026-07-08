"use client";

import { useState } from "react";
import { Plus, Trophy } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import type { Competition, Sport } from "@/types";

export default function AdminCompetitionsPanel({
  competitions,
  sports,
}: {
  competitions: Competition[];
  sports: Sport[];
}) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="space-y-4">
      {competitions.map((competition) => {
        const sport = sports.find((s) => s.id === competition.sportId);
        return (
          <Card key={competition.id} className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
              {sport?.emoji ?? <Trophy size={20} className="text-primary" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{competition.name}</p>
              <p className="text-sm text-muted">
                {sport?.name ?? "—"} · {competition.season}
                {competition.isOfficial ? "" : " · eigen competitie"}
              </p>
            </div>
            {competition.comingSoon ? (
              <Badge tone="neutral">Binnenkort</Badge>
            ) : (
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Actief
              </span>
            )}
          </Card>
        );
      })}

      <Button variant="outline" onClick={() => setShowNote(true)}>
        <Plus size={16} /> Nieuwe competitie
      </Button>
      {showNote && (
        <p className="rounded-xl bg-primary/5 p-3 text-xs text-muted">
          Gebruikers kunnen zelf competities aanmaken via &quot;Maak je eigen competitie&quot; op het
          dashboard — die verschijnen hier automatisch. Voor nieuwe <em>officiële</em> competities
          (zoals de Hoofdklasse of een volgend EK) is het datamodel al generiek opgezet
          (Sports/Competitions/Teams/Matches); dat vraagt hier alleen een formulier, geen nieuwe code.
        </p>
      )}
    </div>
  );
}
