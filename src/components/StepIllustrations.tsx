// Small, dependency-free illustrations for the homepage "how it works"
// steps, so people unfamiliar with prediction-pool concepts immediately
// get the visual idea rather than having to infer it from a generic icon.

export function JoinPoolIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14">
      <circle cx="22" cy="24" r="10" className="fill-primary/20" />
      <circle cx="22" cy="24" r="10" className="fill-primary" fillOpacity="0.35" />
      <circle cx="40" cy="26" r="12" className="fill-primary/15" />
      <circle cx="40" cy="26" r="7" className="fill-primary" />
      <circle cx="20" cy="22" r="5" className="fill-primary" />
      <rect x="12" y="42" width="40" height="8" rx="4" className="fill-primary/20" />
      <rect x="12" y="42" width="24" height="8" rx="4" className="fill-primary" />
    </svg>
  );
}

export function PredictScoreIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14">
      <rect x="6" y="18" width="52" height="28" rx="6" className="fill-primary/10" />
      <rect x="6" y="18" width="52" height="10" rx="5" className="fill-primary" />
      <circle cx="22" cy="40" r="6" className="fill-primary/25" />
      <circle cx="42" cy="40" r="6" className="fill-primary/25" />
      <text x="22" y="44" textAnchor="middle" className="fill-primary text-[9px] font-bold" style={{ font: "bold 9px sans-serif" }}>2</text>
      <text x="42" y="44" textAnchor="middle" className="fill-primary text-[9px] font-bold" style={{ font: "bold 9px sans-serif" }}>1</text>
      <text x="32" y="40" textAnchor="middle" style={{ font: "bold 9px sans-serif" }} className="fill-muted">-</text>
    </svg>
  );
}

export function CollectPointsIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14">
      <rect x="10" y="38" width="10" height="16" rx="2" className="fill-primary/25" />
      <rect x="24" y="28" width="10" height="26" rx="2" className="fill-primary/50" />
      <rect x="38" y="16" width="10" height="38" rx="2" className="fill-primary" />
      <path d="M46 12 l3 6 6 1 -4.5 4.5 1 6.5 -5.5 -3 -5.5 3 1 -6.5 -4.5 -4.5 6 -1 z" className="fill-primary" />
    </svg>
  );
}

export function LeaderboardIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14">
      <rect x="6" y="34" width="14" height="20" rx="2" className="fill-primary/40" />
      <rect x="25" y="20" width="14" height="34" rx="2" className="fill-primary" />
      <rect x="44" y="40" width="14" height="14" rx="2" className="fill-primary/25" />
      <text x="32" y="34" textAnchor="middle" className="fill-primary-foreground" style={{ font: "bold 10px sans-serif" }}>1</text>
      <text x="13" y="47" textAnchor="middle" className="fill-primary-foreground" style={{ font: "bold 9px sans-serif" }}>2</text>
      <text x="51" y="51" textAnchor="middle" className="fill-primary-foreground" style={{ font: "bold 9px sans-serif" }}>3</text>
    </svg>
  );
}
