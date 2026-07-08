"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import Button from "../ui/Button";
import Input from "../ui/Input";
import type { Sponsor } from "@/types";

export default function AdminSponsorsTable({ sponsors }: { sponsors: Sponsor[] }) {
  const addSponsor = useAppStore((s) => s.addSponsor);
  const [name, setName] = useState("");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="rounded-xl border border-border px-4 py-3 text-sm">
            {sponsor.name}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="Naam sponsor" value={name} onChange={(e) => setName(e.target.value)} />
        <Button
          onClick={() => {
            if (!name.trim()) return;
            addSponsor(name.trim());
            setName("");
          }}
        >
          Toevoegen
        </Button>
      </div>
    </div>
  );
}
