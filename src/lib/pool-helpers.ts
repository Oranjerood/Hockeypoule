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
  Division,
  LeaderboardRow,
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

export function getMatchesForCompetition(
  allMatches: Match[],
  competitionId: string,
  division?: Division
) {
  return allMatches.filter(
    (m) =>
      m.competitionId === competitionId &&
      (division === undefined || m.division === division)
  );
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
  const matches = getMatchesForCompetition(allMatches, pool.competitionId, pool.division);
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

// Combine two "official" pools (e.g. women's + men's national pool for the
// same event) into one ranking of total points per user across both. Only
// users who are members of BOTH pools are included, since the combined
// ranking is about who's on top across the whole event.
export function computeOverallStandings(
  poolA: Pool,
  poolB: Pool,
  poolMembers: PoolMember[],
  users: User[],
  predictions: Prediction[],
  specialPredictions: SpecialPrediction[],
  settingsA: PointsSettings,
  settingsB: PointsSettings,
  allMatches: Match[]
): LeaderboardRow[] {
  const leaderboardA = computePoolLeaderboard(
    poolA, poolMembers, users, predictions, specialPredictions, settingsA, allMatches
  );
  const leaderboardB = computePoolLeaderboard(
    poolB, poolMembers, users, predictions, specialPredictions, settingsB, allMatches
  );

  const memberIdsA = new Set(getMembersForPool(poolMembers, poolA.id).map((m) => m.userId));
  const memberIdsB = new Set(getMembersForPool(poolMembers, poolB.id).map((m) => m.userId));
  const bothMemberIds = [...memberIdsA].filter((id) => memberIdsB.has(id));

  const rows: LeaderboardRow[] = bothMemberIds.map((userId) => {
    const user = users.find((u) => u.id === userId)!;
    const rowA = leaderboardA.find((r) => r.userId === userId);
    const rowB = leaderboardB.find((r) => r.userId === userId);
    const points = (rowA?.points ?? 0) + (rowB?.points ?? 0);
    const correctPredictions = (rowA?.correctPredictions ?? 0) + (rowB?.correctPredictions ?? 0);
    const totalPredictions = (rowA?.totalPredictions ?? 0) + (rowB?.totalPredictions ?? 0);
    return {
      userId,
      name: user.name,
      avatarColor: user.avatarColor,
      points,
      correctPredictions,
      totalPredictions,
      accuracy: totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0,
      position: 0,
    };
  });

  rows.sort((a, b) => b.points - a.points || b.accuracy - a.accuracy);
  rows.forEach((row, index) => { row.position = index + 1; });

  return rows;
}
