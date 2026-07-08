// Small, realistic-looking mockups for the homepage "how it works" steps
// (rather than abstract icons), so people unfamiliar with prediction-pool
// concepts immediately get a real picture of what the product looks like.

export function JoinPoolMockup() {
  return (
    <div className="w-full rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between rounded-lg bg-surface px-2.5 py-2 shadow-sm">
        <span className="text-xs font-medium">Kantoor WK Poule</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          12 leden
        </span>
      </div>
      <div className="mt-2.5 flex -space-x-2">
        <span className="h-6 w-6 rounded-full border-2 border-background bg-primary" />
        <span className="h-6 w-6 rounded-full border-2 border-background bg-primary/70" />
        <span className="h-6 w-6 rounded-full border-2 border-background bg-primary/40" />
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-border text-[9px] font-semibold text-muted">
          +9
        </span>
      </div>
    </div>
  );
}

export function PredictScoreMockup() {
  return (
    <div className="w-full rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between text-xs font-medium">
        <span>🇳🇱 Nederland</span>
        <span>🇦🇷 Argentinië</span>
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-2">
        <span className="flex h-8 w-9 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold shadow-sm">
          3
        </span>
        <span className="text-xs text-muted">-</span>
        <span className="flex h-8 w-9 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold shadow-sm">
          1
        </span>
      </div>
    </div>
  );
}

export function CollectPointsMockup() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-3">
      <span className="text-xs text-muted">Nederland 3-1 Argentinië · jouw voorspelling 3-1</span>
      <span className="rounded-full bg-success/10 px-3 py-1.5 text-sm font-bold text-success">
        +15 punten
      </span>
    </div>
  );
}

export function LeaderboardMockup() {
  const rows = [
    { pos: 1, name: "Sanne", pts: 128 },
    { pos: 2, name: "Jeroen", pts: 114 },
    { pos: 3, name: "Mo", pts: 109 },
  ];
  return (
    <div className="w-full rounded-xl border border-border bg-background p-2">
      {rows.map((row) => (
        <div key={row.pos} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs">
          <span className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                row.pos === 1 ? "bg-primary text-primary-foreground" : "bg-surface text-muted"
              }`}
            >
              {row.pos}
            </span>
            {row.name}
          </span>
          <span className="font-semibold">{row.pts} pt</span>
        </div>
      ))}
    </div>
  );
}
