// Core domain types for the platform.
// Designed to be sport- and competition-agnostic: any sport, any level,
// any competition (official or user-created) can be added without
// changing this schema.

export type MatchStatus = "upcoming" | "live" | "finished";
export type PoolVisibility = "public" | "private";
export type PoolMemberRole = "owner" | "member";

export interface Sport {
  id: string;
  name: string;
  slug: string;
  emoji: string;
}

export interface Competition {
  id: string;
  name: string; // e.g. "WK Hockey 2026", "Hoofdklasse Hockey 2026/27"
  sportId: string;
  season: string; // e.g. "2026" or "2026/27"
  startDate: string; // ISO date
  endDate: string; // ISO date
  groups: string[]; // e.g. ["Pool A", "Pool B"]
  logoUrl?: string;
  isActive: boolean;
  isOfficial: boolean; // official platform competition vs. user-created
  comingSoon?: boolean; // official competition not yet open for predictions
  entryFeeCents: number; // one-time access fee for this competition (0 = free)
  supportBeneficiaryName?: string; // e.g. "Oranje-Rood Dames 1"
  supportBeneficiaryDescription?: string;
  createdBy?: string; // userId, only set for custom (non-official) competitions
}

export interface Team {
  id: string;
  competitionId: string;
  name: string;
  country: string;
  flagEmoji: string;
  logoUrl?: string;
  group?: string;
}

export interface Match {
  id: string;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string; // ISO date
  time: string; // HH:mm
  location: string;
  group?: string;
  round: string; // e.g. "Groepsfase - Ronde 1", "Kwartfinale", "Finale"
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  homeShootout?: number;
  awayShootout?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  isAdmin?: boolean;
}

// Granted once a user (or their company) pays the one-time entry fee for a
// competition. Unlocks the official/national pool plus unlimited free
// private pools for that competition.
export interface CompetitionAccess {
  id: string;
  competitionId: string;
  userId: string;
  baseAmountCents: number; // the entry fee actually paid
  supportAmountCents: number; // optional extra amount to support the beneficiary
  companyId?: string; // set when access was granted via a company seat
  purchasedAt: string;
  molliePaymentId?: string;
}

// A company that buys bulk access ("seats") to a competition for its
// employees instead of everyone paying individually.
export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  competitionId: string;
  ownerId: string; // the company admin (a User)
  seatsPurchased: number;
  inviteCode: string;
  poolId: string; // the company's own branded pool
  createdAt: string;
}

export interface Pool {
  id: string;
  name: string;
  logoUrl?: string;
  visibility: PoolVisibility;
  inviteCode: string;
  competitionId: string;
  ownerId: string;
  isNational?: boolean; // the one official pool every paid user auto-joins
  isCompany?: boolean;
  companyId?: string;
  createdAt: string;
}

export interface PoolMember {
  poolId: string;
  userId: string;
  role: PoolMemberRole;
  joinedAt: string;
  department?: string; // optional, for company pool department leaderboards
}

export interface Prediction {
  id: string;
  poolId: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  updatedAt: string;
}

export interface SpecialPrediction {
  poolId: string;
  userId: string;
  competitionId: string;
  championTeamId?: string;
  finalistTeamIds?: string[]; // exactly 2
  topscorerName?: string;
  surpriseTeamId?: string;
}

export interface PointsSettings {
  exactScore: number;
  correctWinner: number;
  correctDraw: number;
  correctGoalDifference: number;
  champion: number;
  finalist: number;
  topscorer: number;
  surpriseTeam: number;
}

export interface LeaderboardRow {
  userId: string;
  name: string;
  avatarColor: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
  accuracy: number; // 0-100
  position: number;
}

export interface RoundStat {
  round: string;
  points: number;
}

export interface UserStats {
  bestRound?: RoundStat;
  worstRound?: RoundStat;
  exactScoresCount: number;
  averagePoints: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  competitionId?: string;
}

export interface Prize {
  id: string;
  title: string;
  description: string;
  competitionId?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name, resolved in the UI
}
