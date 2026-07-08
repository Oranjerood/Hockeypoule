"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import Button from "../ui/Button";
import Input, { Label } from "../ui/Input";
import Card from "../ui/Card";
import type { Prize } from "@/types";

export default function AdminPrizesTable({ prizes }: { prizes: Prize[] }) {
  const addPrize = useAppStore((s) => s.addPrize);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {prizes.map((prize) => (
          <Card key={prize.id} className="p-4">
            <p className="font-medium">{prize.title}</p>
            <p className="mt-1 text-sm text-muted">{prize.description}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Titel</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Omschrijving</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <Button
          className="mt-3"
          onClick={() => {
            if (!title.trim()) return;
            addPrize(title.trim(), description.trim());
            setTitle("");
            setDescription("");
          }}
        >
          Prijs toevoegen
        </Button>
      </Card>
    </div>
  );
}
