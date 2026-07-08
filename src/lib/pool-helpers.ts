import type {
  Pool,
  PoolMember,
  User,
  Prediction,
  SpecialPrediction,
  PointsSettings,
  Match,
  Competition,
  CompetitionAccess,
} from "@/types";
import { buildLeaderboard } from "@/lib/scoring";

export function getMembersForPool(poolMembers: PoolMember[], poolId: string) {
  return poolMembers.filter((m) => m.poolId === poolId);
}

export function getPoolsForUser(
  pools: Pool[],
  poolMembers: PoolMember[],
  userId: string
) {
  const memberships = poolMembers.filter((m) => m.userId === userId);
  return memberships
    .map((m) => {
      const pool = pools.find((p) => p.id === m.poolId);
      return pool ? { pool, role: m.role } : null;
    })
    .filter((x): x is { pool: Pool; role: "owner" | "member" } => x !== null);
}

export function getMatchesForCompetition(allMatches: Match[], competitionId: string) {
  return allMatches.filter((m) => m.competitionId === competitionId);
}

// A user has access to a competition if it's free (entryFeeCents === 0,
// e.g. a custom league) or if they (or their company) paid the one-time
// entry fee.
export function hasCompetitionAccess(
  competition: Competition,
  access: CompetitionAccess[],
  userId: string
): boolean {
  if (competition.entryFeeCents === 0) return true;
  return access.some((a) => a.competitionId === competition.id && a.userId === userId);
}

export function getAccessForUser(
  access: CompetitionAccess[],
  competitionId: string,
  userId: string
) {
  return access.find((a) => a.competitionId === competitionId && a.userId === userId);
}

export function computePoolLeaderboard(
  pool: Pool,
  poolMembers: PoolMember[],
  users: User[],
  predictions: Prediction[],
  specialPredictions: SpecialPrediction[],
  settings: PointsSettings,
  allMatches: Match[]
) {
  const memberIds = getMembersForPool(poolMembers, pool.id).map((m) => m.userId);
  const poolUsers = users.filter((u) => memberIds.includes(u.id));
  const matches = getMatchesForCompetition(allMatches, pool.competitionId);
  const poolPredictions = predictions.filter((p) => p.poolId === pool.id);
  const poolSpecials = specialPredictions.filter((sp) => sp.poolId === pool.id);

  // The tournament is still in progress in the demo dataset, so there is no
  // confirmed champion/finalists/topscorer yet.
  const specialResult = {
    championTeamId: undefined,
    finalistTeamIds: undefined,
    topscorerName: undefined,
    surpriseTeamId: undefined,
  };

  return buildLeaderboard(
    poolUsers,
    matches,
    poolPredictions,
    poolSpecials,
    specialResult,
    settings
  );
}
