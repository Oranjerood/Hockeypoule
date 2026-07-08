import type { Sport } from "@/types";

export default function AdminSportsTable({ sports }: { sports: Sport[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sports.map((sport) => (
        <div key={sport.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
          <span className="text-2xl">{sport.emoji}</span>
          <span className="font-medium">{sport.name}</span>
        </div>
      ))}
    </div>
  );
}
