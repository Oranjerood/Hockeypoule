import type {
  Badge,
  Pool,
  PoolMember,
  Prediction,
  Match,
  Competition,
  User,
  SpecialPrediction,
  PointsSettings,
} from "@/types";
import { buildUserStats, scoreMatchPrediction, DEFAULT_POINTS_SETTINGS } from "@/lib/scoring";
import { getMatchesForCompetition, computePoolLeaderboard } from "@/lib/pool-helpers";

export function computeBadges(
  userId: string,
  ctx: {
    pools: Pool[];
    poolMembers: PoolMember[];
    predictions: Prediction[];
    specialPredictions: SpecialPrediction[];
    matches: Match[];
    competitions: Competition[];
    users: User[];
    getPointsSettings: (poolId: string) => PointsSettings;
  }
): Badge[] {
  const badges: Badge[] = [];
  const myMemberships = ctx.poolMembers.filter((m) => m.userId === userId);
  const myPools = myMemberships
    .map((m) => ctx.pools.find((p) => p.id === m.poolId))
    .filter((p): p is Pool => !!p);

  const myPredictions = ctx.predictions.filter((p) => p.userId === userId);

  // Podium finish in any pool.
  const reachedPodium = myPools.some((pool) => {
    const settings = ctx.getPointsSettings(pool.id);
    const leaderboard = computePoolLeaderboard(
      pool,
      ctx.poolMembers,
      ctx.users,
      ctx.predictions,
      ctx.specialPredictions,
      settings,
      ctx.matches
    );
    const row = leaderboard.find((r) => r.userId === userId);
    return !!row && row.position <= 3 && leaderboard.length >= 3;
  });
  if (reachedPodium) {
    badges.push({
      id: "badge-podium",
      title: "Op het podium",
      description: "Bij de beste 3 in een van je poules.",
      icon: "Trophy",
    });
  }

  // Exact score expert: 3+ exact scores across all pools.
  let totalExactScores = 0;
  for (const pool of myPools) {
    const settings = ctx.getPointsSettings(pool.id);
    const matches = getMatchesForCompetition(ctx.matches, pool.competitionId);
    const stats = buildUserStats(userId, matches, ctx.predictions, settings);
    totalExactScores += stats.exactScoresCount;
  }
  if (totalExactScores >= 3) {
    badges.push({
      id: "badge-exact",
      title: "Exacte-uitslag expert",
      description: `${totalExactScores} keer de exacte uitslag goed voorspeld.`,
      icon: "Target",
    });
  }

  // Loyal predictor: 10+ predictions made.
  if (myPredictions.length >= 10) {
    badges.push({
      id: "badge-loyal",
      title: "Trouwe voorspeller",
      description: `${myPredictions.length} voorspellingen gedaan.`,
      icon: "Flame",
    });
  }

  // Early bird: joined a pool before its competition started.
  const earlyBird = myMemberships.some((m) => {
    const pool = ctx.pools.find((p) => p.id === m.poolId);
    const competition = pool && ctx.competitions.find((c) => c.id === pool.competitionId);
    return competition && new Date(m.joinedAt) < new Date(competition.startDate);
  });
  if (earlyBird) {
    badges.push({
      id: "badge-early",
      title: "Vroege vogel",
      description: "Meegedaan voordat de competitie begon.",
      icon: "Sunrise",
    });
  }

  // Sharp shooter: 60%+ accuracy on finished predictions.
  const finishedPredictions = myPredictions.filter((p) => {
    const match = ctx.matches.find((m) => m.id === p.matchId);
    return match?.status === "finished";
  });
  if (finishedPredictions.length >= 5) {
    const correct = finishedPredictions.filter((p) => {
      const match = ctx.matches.find((m) => m.id === p.matchId)!;
      return scoreMatchPrediction(match, p, DEFAULT_POINTS_SETTINGS) > 0;
    }).length;
    if (correct / finishedPredictions.length >= 0.6) {
      badges.push({
        id: "badge-sharp",
        title: "Scherpschutter",
        description: "Meer dan 60% van je voorspellingen scoort punten.",
        icon: "Crosshair",
      });
    }
  }

  return badges;
}
