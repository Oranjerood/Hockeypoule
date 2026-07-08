import type {
  Sport,
  Competition,
  Team,
  Match,
  User,
  Pool,
  PoolMember,
  Prediction,
  SpecialPrediction,
  Company,
  CompetitionAccess,
  Sponsor,
  Prize,
} from "@/types";

// -----------------------------------------------------------------------
// NOTE: This is illustrative sample data for the prototype, not an official
// schedule. In production this all comes from Supabase (see db/schema.sql).
// The data is structured to prove the platform works across sports and
// competition levels, not just one hockey tournament.
// -----------------------------------------------------------------------

export const SPORTS: Sport[] = [
  { id: "sport-hockey", name: "Hockey", slug: "hockey", emoji: "🏑" },
  { id: "sport-football", name: "Voetbal", slug: "football", emoji: "⚽" },
  { id: "sport-basketball", name: "Basketbal", slug: "basketball", emoji: "🏀" },
  { id: "sport-tennis", name: "Tennis", slug: "tennis", emoji: "🎾" },
  { id: "sport-padel", name: "Padel", slug: "padel", emoji: "🎾" },
  { id: "sport-volleyball", name: "Volleybal", slug: "volleyball", emoji: "🏐" },
];

// --- Official competition #1: the launch competition -------------------
export const WK_HOCKEY: Competition = {
  id: "comp-wk-hockey-2026",
  name: "WK Hockey 2026",
  sportId: "sport-hockey",
  season: "2026",
  startDate: "2026-06-27",
  endDate: "2026-07-12",
  groups: ["Pool A", "Pool B"],
  isActive: true,
  isOfficial: true,
  entryFeeCents: 400,
  supportBeneficiaryName: "Oranje-Rood Dames 1",
  supportBeneficiaryDescription: "Teamfonds van Oranje-Rood Dames 1",
};

// --- Official competition #2: proves the platform isn't a one-tournament
// site — same sport, different level, opens after the World Cup. --------
export const HOOFDKLASSE: Competition = {
  id: "comp-hoofdklasse-2026",
  name: "Hoofdklasse Hockey 2026/27",
  sportId: "sport-hockey",
  season: "2026/27",
  startDate: "2026-09-05",
  endDate: "2027-04-25",
  groups: [],
  isActive: false,
  isOfficial: true,
  comingSoon: true,
  entryFeeCents: 0,
};

// --- Custom, user-created competition: proves "your own league" works
// for any sport, created without any code changes. ----------------------
export const CUSTOM_FOOTBALL: Competition = {
  id: "comp-custom-office-football",
  name: "Vrijdagmiddag Voetbal — Kantoor",
  sportId: "sport-football",
  season: "2026",
  startDate: "2026-05-01",
  endDate: "2026-07-03",
  groups: [],
  isActive: true,
  isOfficial: false,
  entryFeeCents: 0,
  createdBy: "u-niels",
};

export const COMPETITIONS: Competition[] = [WK_HOCKEY, HOOFDKLASSE, CUSTOM_FOOTBALL];

export const TEAMS: Team[] = [
  // WK Hockey 2026
  { id: "team-ned", competitionId: WK_HOCKEY.id, name: "Nederland", country: "Nederland", flagEmoji: "🇳🇱", group: "Pool A" },
  { id: "team-ger", competitionId: WK_HOCKEY.id, name: "Duitsland", country: "Duitsland", flagEmoji: "🇩🇪", group: "Pool A" },
  { id: "team-aus", competitionId: WK_HOCKEY.id, name: "Australië", country: "Australië", flagEmoji: "🇦🇺", group: "Pool A" },
  { id: "team-arg", competitionId: WK_HOCKEY.id, name: "Argentinië", country: "Argentinië", flagEmoji: "🇦🇷", group: "Pool A" },
  { id: "team-bel", competitionId: WK_HOCKEY.id, name: "België", country: "België", flagEmoji: "🇧🇪", group: "Pool B" },
  { id: "team-ind", competitionId: WK_HOCKEY.id, name: "India", country: "India", flagEmoji: "🇮🇳", group: "Pool B" },
  { id: "team-eng", competitionId: WK_HOCKEY.id, name: "Engeland", country: "Engeland", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "Pool B" },
  { id: "team-esp", competitionId: WK_HOCKEY.id, name: "Spanje", country: "Spanje", flagEmoji: "🇪🇸", group: "Pool B" },
  // Custom office football league
  { id: "team-noord", competitionId: CUSTOM_FOOTBALL.id, name: "Team Noord", country: "Kantoor", flagEmoji: "⚽" },
  { id: "team-zuid", competitionId: CUSTOM_FOOTBALL.id, name: "Team Zuid", country: "Kantoor", flagEmoji: "⚽" },
  { id: "team-oost", competitionId: CUSTOM_FOOTBALL.id, name: "Team Oost", country: "Kantoor", flagEmoji: "⚽" },
  { id: "team-west", competitionId: CUSTOM_FOOTBALL.id, name: "Team West", country: "Kantoor", flagEmoji: "⚽" },
];

const t = (id: string) => TEAMS.find((team) => team.id === id)!;

// Group stage: round robin per group, all finished (before "today").
export const MATCHES: Match[] = [
  // --- WK Hockey — Pool A ---
  { id: "m-a1", competitionId: WK_HOCKEY.id, homeTeamId: "team-ned", awayTeamId: "team-arg", date: "2026-06-27", time: "17:00", location: "Amstelveen", group: "Pool A", round: "Groepsfase - Ronde 1", status: "finished", homeScore: 3, awayScore: 1 },
  { id: "m-a2", competitionId: WK_HOCKEY.id, homeTeamId: "team-ger", awayTeamId: "team-aus", date: "2026-06-27", time: "19:30", location: "Amstelveen", group: "Pool A", round: "Groepsfase - Ronde 1", status: "finished", homeScore: 2, awayScore: 2 },
  { id: "m-a3", competitionId: WK_HOCKEY.id, homeTeamId: "team-ned", awayTeamId: "team-ger", date: "2026-06-29", time: "17:00", location: "Amstelveen", group: "Pool A", round: "Groepsfase - Ronde 2", status: "finished", homeScore: 2, awayScore: 1 },
  { id: "m-a4", competitionId: WK_HOCKEY.id, homeTeamId: "team-aus", awayTeamId: "team-arg", date: "2026-06-29", time: "19:30", location: "Amstelveen", group: "Pool A", round: "Groepsfase - Ronde 2", status: "finished", homeScore: 1, awayScore: 1 },
  { id: "m-a5", competitionId: WK_HOCKEY.id, homeTeamId: "team-ned", awayTeamId: "team-aus", date: "2026-07-01", time: "17:00", location: "Amstelveen", group: "Pool A", round: "Groepsfase - Ronde 3", status: "finished", homeScore: 4, awayScore: 0 },
  { id: "m-a6", competitionId: WK_HOCKEY.id, homeTeamId: "team-ger", awayTeamId: "team-arg", date: "2026-07-01", time: "19:30", location: "Amstelveen", group: "Pool A", round: "Groepsfase - Ronde 3", status: "finished", homeScore: 3, awayScore: 0 },
  // --- WK Hockey — Pool B ---
  { id: "m-b1", competitionId: WK_HOCKEY.id, homeTeamId: "team-bel", awayTeamId: "team-esp", date: "2026-06-28", time: "17:00", location: "Antwerpen", group: "Pool B", round: "Groepsfase - Ronde 1", status: "finished", homeScore: 3, awayScore: 2 },
  { id: "m-b2", competitionId: WK_HOCKEY.id, homeTeamId: "team-ind", awayTeamId: "team-eng", date: "2026-06-28", time: "19:30", location: "Antwerpen", group: "Pool B", round: "Groepsfase - Ronde 1", status: "finished", homeScore: 2, awayScore: 1 },
  { id: "m-b3", competitionId: WK_HOCKEY.id, homeTeamId: "team-bel", awayTeamId: "team-ind", date: "2026-06-30", time: "17:00", location: "Antwerpen", group: "Pool B", round: "Groepsfase - Ronde 2", status: "finished", homeScore: 1, awayScore: 1 },
  { id: "m-b4", competitionId: WK_HOCKEY.id, homeTeamId: "team-eng", awayTeamId: "team-esp", date: "2026-06-30", time: "19:30", location: "Antwerpen", group: "Pool B", round: "Groepsfase - Ronde 2", status: "finished", homeScore: 2, awayScore: 0 },
  { id: "m-b5", competitionId: WK_HOCKEY.id, homeTeamId: "team-bel", awayTeamId: "team-eng", date: "2026-07-02", time: "17:00", location: "Antwerpen", group: "Pool B", round: "Groepsfase - Ronde 3", status: "finished", homeScore: 2, awayScore: 2 },
  { id: "m-b6", competitionId: WK_HOCKEY.id, homeTeamId: "team-ind", awayTeamId: "team-esp", date: "2026-07-02", time: "19:30", location: "Antwerpen", group: "Pool B", round: "Groepsfase - Ronde 3", status: "finished", homeScore: 3, awayScore: 1 },
  // --- WK Hockey — Semifinals (crossover): A1 vs B2, B1 vs A2 ---
  { id: "m-sf1", competitionId: WK_HOCKEY.id, homeTeamId: "team-ned", awayTeamId: "team-ind", date: "2026-07-07", time: "20:00", location: "Amsterdam - Wagener Stadion", round: "Halve finale", status: "live", homeScore: 1, awayScore: 1 },
  { id: "m-sf2", competitionId: WK_HOCKEY.id, homeTeamId: "team-bel", awayTeamId: "team-ger", date: "2026-07-09", time: "20:00", location: "Amsterdam - Wagener Stadion", round: "Halve finale", status: "upcoming" },
  // --- WK Hockey — Final & 3rd place ---
  { id: "m-3rd", competitionId: WK_HOCKEY.id, homeTeamId: "team-ind", awayTeamId: "team-ger", date: "2026-07-12", time: "14:00", location: "Amsterdam - Wagener Stadion", round: "Troostfinale", status: "upcoming" },
  { id: "m-final", competitionId: WK_HOCKEY.id, homeTeamId: "team-ned", awayTeamId: "team-bel", date: "2026-07-12", time: "17:00", location: "Amsterdam - Wagener Stadion", round: "Finale", status: "upcoming" },

  // --- Custom office football league ---
  { id: "m-cf1", competitionId: CUSTOM_FOOTBALL.id, homeTeamId: "team-noord", awayTeamId: "team-zuid", date: "2026-05-08", time: "17:30", location: "Trapveld kantoor", round: "Speelronde 1", status: "finished", homeScore: 2, awayScore: 2 },
  { id: "m-cf2", competitionId: CUSTOM_FOOTBALL.id, homeTeamId: "team-oost", awayTeamId: "team-west", date: "2026-05-08", time: "18:15", location: "Trapveld kantoor", round: "Speelronde 1", status: "finished", homeScore: 1, awayScore: 3 },
  { id: "m-cf3", competitionId: CUSTOM_FOOTBALL.id, homeTeamId: "team-noord", awayTeamId: "team-oost", date: "2026-07-10", time: "17:30", location: "Trapveld kantoor", round: "Speelronde 2", status: "upcoming" },
  { id: "m-cf4", competitionId: CUSTOM_FOOTBALL.id, homeTeamId: "team-zuid", awayTeamId: "team-west", date: "2026-07-10", time: "18:15", location: "Trapveld kantoor", round: "Speelronde 2", status: "upcoming" },
];

export const USERS: User[] = [
  { id: "u-niels", name: "Niels", email: "nielsvanwetten@gmail.com", avatarColor: "#F97316", isAdmin: true },
  { id: "u-sanne", name: "Sanne", email: "sanne@example.com", avatarColor: "#0EA5E9" },
  { id: "u-milan", name: "Milan", email: "milan@example.com", avatarColor: "#22C55E" },
  { id: "u-fleur", name: "Fleur", email: "fleur@example.com", avatarColor: "#A855F7" },
  { id: "u-daan", name: "Daan", email: "daan@example.com", avatarColor: "#EF4444" },
];

// One-time competition access (the EUR 4 entry fee for WK Hockey). Free
// competitions (entryFeeCents === 0) don't need an access record — see
// hasCompetitionAccess() in pool-helpers.ts.
export const COMPETITION_ACCESS: CompetitionAccess[] = [
  { id: "acc-niels", competitionId: WK_HOCKEY.id, userId: "u-niels", baseAmountCents: 400, supportAmountCents: 500, purchasedAt: "2026-06-02" },
  { id: "acc-sanne", competitionId: WK_HOCKEY.id, userId: "u-sanne", baseAmountCents: 400, supportAmountCents: 0, purchasedAt: "2026-06-03" },
  { id: "acc-milan", competitionId: WK_HOCKEY.id, userId: "u-milan", baseAmountCents: 400, supportAmountCents: 250, purchasedAt: "2026-06-04" },
  { id: "acc-fleur", competitionId: WK_HOCKEY.id, userId: "u-fleur", baseAmountCents: 400, supportAmountCents: 0, purchasedAt: "2026-06-05" },
  { id: "acc-daan", competitionId: WK_HOCKEY.id, userId: "u-daan", baseAmountCents: 400, supportAmountCents: 1000, purchasedAt: "2026-06-05" },
];

export const COMPANIES: Company[] = [
  {
    id: "company-achmea",
    name: "Achmea Verzekeringen",
    primaryColor: "#0EA5E9",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-fleur",
    seatsPurchased: 20,
    inviteCode: "ACHMEA26",
    poolId: "pool-achmea",
    createdAt: "2026-06-01",
  },
];

export const POOLS: Pool[] = [
  {
    id: "pool-national",
    name: "Officiële WK Hockey Poule",
    visibility: "public",
    inviteCode: "WKNL2026",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-niels",
    isNational: true,
    createdAt: "2026-06-01",
  },
  {
    id: "pool-office",
    name: "Kantoor WK Poule",
    visibility: "private",
    inviteCode: "KANTOOR8",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-niels",
    createdAt: "2026-06-05",
  },
  {
    id: "pool-achmea",
    name: "Achmea Verzekeringen — WK Poule",
    visibility: "private",
    inviteCode: "ACHMEA26",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-fleur",
    isCompany: true,
    companyId: "company-achmea",
    createdAt: "2026-06-01",
  },
  {
    id: "pool-custom-football",
    name: "Vrijdagmiddag Voetbal Poule",
    visibility: "private",
    inviteCode: "VRIJMID1",
    competitionId: CUSTOM_FOOTBALL.id,
    ownerId: "u-niels",
    createdAt: "2026-04-20",
  },
];

export const POOL_MEMBERS: PoolMember[] = [
  ...USERS.map((u): PoolMember => ({ poolId: "pool-national", userId: u.id, role: u.id === "u-niels" ? "owner" : "member", joinedAt: "2026-06-02" })),
  { poolId: "pool-office", userId: "u-niels", role: "owner", joinedAt: "2026-06-05" },
  { poolId: "pool-office", userId: "u-sanne", role: "member", joinedAt: "2026-06-06" },
  { poolId: "pool-office", userId: "u-milan", role: "member", joinedAt: "2026-06-07" },
  { poolId: "pool-achmea", userId: "u-fleur", role: "owner", joinedAt: "2026-06-01" },
  { poolId: "pool-achmea", userId: "u-daan", role: "member", joinedAt: "2026-06-08", department: "Sales" },
  { poolId: "pool-custom-football", userId: "u-niels", role: "owner", joinedAt: "2026-04-20" },
  { poolId: "pool-custom-football", userId: "u-milan", role: "member", joinedAt: "2026-04-21" },
];

// Deterministic "variation" so each demo user has a slightly different,
// but plausible, predicted score for every finished match.
function variedScore(actual: number, seed: number): number {
  const delta = ((seed % 3) - 1) as -1 | 0 | 1; // -1, 0 or 1
  return Math.max(0, actual + delta);
}

const finishedWkMatches = MATCHES.filter(
  (m) => m.competitionId === WK_HOCKEY.id && m.status === "finished"
);

export const PREDICTIONS: Prediction[] = USERS.flatMap((user, userIndex) =>
  finishedWkMatches.map((match, matchIndex) => {
    const seed = userIndex * 5 + matchIndex;
    // Niels (index 0) predicts every exact score correctly for a good demo.
    const homeScore =
      userIndex === 0 ? match.homeScore! : variedScore(match.homeScore!, seed);
    const awayScore =
      userIndex === 0 ? match.awayScore! : variedScore(match.awayScore!, seed + 2);
    return {
      id: `pred-${user.id}-${match.id}`,
      poolId: "pool-national",
      userId: user.id,
      matchId: match.id,
      homeScore,
      awayScore,
      updatedAt: "2026-06-26",
    };
  })
);

export const SPECIAL_PREDICTIONS: SpecialPrediction[] = [
  { poolId: "pool-national", userId: "u-niels", competitionId: WK_HOCKEY.id, championTeamId: "team-ned", finalistTeamIds: ["team-ned", "team-bel"], topscorerName: "Jip Janssen" },
  { poolId: "pool-national", userId: "u-sanne", competitionId: WK_HOCKEY.id, championTeamId: "team-bel", finalistTeamIds: ["team-ned", "team-bel"], topscorerName: "Arthur van Doren" },
  { poolId: "pool-national", userId: "u-milan", competitionId: WK_HOCKEY.id, championTeamId: "team-ned", finalistTeamIds: ["team-ned", "team-ger"], topscorerName: "Jip Janssen" },
  { poolId: "pool-national", userId: "u-fleur", competitionId: WK_HOCKEY.id, championTeamId: "team-ind", finalistTeamIds: ["team-ind", "team-bel"], topscorerName: "Harmanpreet Singh" },
  { poolId: "pool-national", userId: "u-daan", competitionId: WK_HOCKEY.id, championTeamId: "team-ger", finalistTeamIds: ["team-ger", "team-ned"], topscorerName: "Tom Boon" },
];

export const SPONSORS: Sponsor[] = [
  { id: "sponsor-1", name: "Gouda Sport", competitionId: WK_HOCKEY.id },
];

export const PRIZES: Prize[] = [
  { id: "prize-1", title: "Clinic met het Nederlands team", description: "Een hockeyclinic voor jou en 3 vrienden.", competitionId: WK_HOCKEY.id },
  { id: "prize-2", title: "2 tickets voor de finale", description: "Bekijk de WK-finale live vanaf de tribune.", competitionId: WK_HOCKEY.id },
  { id: "prize-3", title: "Gesigneerd shirt Oranje-Rood Dames 1", description: "Voor de nummer 1 van de landelijke poule.", competitionId: WK_HOCKEY.id },
];

export function getTeam(teamId: string): Team {
  return t(teamId);
}

export function getTeamsByGroup(competitionId: string, group: string): Team[] {
  return TEAMS.filter((team) => team.competitionId === competitionId && team.group === group);
}

export function getSport(sportId: string): Sport | undefined {
  return SPORTS.find((s) => s.id === sportId);
}

export function getCompetition(competitionId: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.id === competitionId);
}
