import type {
  Match,
  Prediction,
  SpecialPrediction,
  PointsSettings,
  User,
  LeaderboardRow,
  UserStats,
  RoundStat,
} from "@/types";

// Default, admin-editable points system. Mirrors the request:
// exact score = 5, correct winner = 3, correct draw = 3,
// correct goal difference = 1, champion = 20, finalist = 10, topscorer = 15.
export const DEFAULT_POINTS_SETTINGS: PointsSettings = {
  exactScore: 5,
  correctWinner: 3,
  correctDraw: 3,
  correctGoalDifference: 1,
  champion: 20,
  finalist: 10,
  topscorer: 15,
  surpriseTeam: 10,
};

/**
 * Calculate the points a single prediction earns for a finished match,
 * given a (possibly admin-customized) points system.
 */
export function scoreMatchPrediction(
  match: Match,
  prediction: Prediction | undefined,
  settings: PointsSettings
): number {
  if (!prediction) return 0;
  if (match.status !== "finished") return 0;
  if (match.homeScore == null || match.awayScore == null) return 0;

  const { homeScore: pHome, awayScore: pAway } = prediction;
  const { homeScore: rHome, awayScore: rAway } = match;

  // Exact score match takes priority over other rules.
  if (pHome === rHome && pAway === rAway) {
    return settings.exactScore;
  }

  let points = 0;
  const predictedDraw = pHome === pAway;
  const actualDraw = rHome === rAway;

  if (predictedDraw && actualDraw) {
    points += settings.correctDraw;
  } else if (!predictedDraw && !actualDraw) {
    const predictedWinner = pHome > pAway ? "home" : "away";
    const actualWinner = rHome > rAway ? "home" : "away";
    if (predictedWinner === actualWinner) {
      points += settings.correctWinner;
    }
  }

  const predictedDiff = pHome - pAway;
  const actualDiff = rHome - rAway;
  if (predictedDiff === actualDiff && !(predictedDraw && actualDraw)) {
    points += settings.correctGoalDifference;
  }

  return points;
}

interface SpecialResult {
  championTeamId?: string;
  finalistTeamIds?: string[];
  topscorerName?: string;
  surpriseTeamId?: string;
}

export function scoreSpecialPrediction(
  prediction: SpecialPrediction | undefined,
  result: SpecialResult,
  settings: PointsSettings
): number {
  if (!prediction) return 0;
  let points = 0;

  if (
    result.championTeamId &&
    prediction.championTeamId === result.championTeamId
  ) {
    points += settings.champion;
  }

  if (result.finalistTeamIds && prediction.finalistTeamIds) {
    const correctFinalists = prediction.finalistTeamIds.filter((id) =>
      result.finalistTeamIds!.includes(id)
    );
    // Award finalist points per correctly predicted finalist.
    points += correctFinalists.length * settings.finalist;
  }

  if (
    result.topscorerName &&
    prediction.topscorerName &&
    prediction.topscorerName.trim().toLowerCase() ===
      result.topscorerName.trim().toLowerCase()
  ) {
    points += settings.topscorer;
  }

  if (
    result.surpriseTeamId &&
    prediction.surpriseTeamId === result.surpriseTeamId
  ) {
    points += settings.surpriseTeam;
  }

  return points;
}

/**
 * Build a full leaderboard for a pool: total points, correct predictions and
 * accuracy per user, sorted and ranked.
 */
export function buildLeaderboard(
  users: User[],
  matches: Match[],
  predictions: Prediction[],
  specialPredictions: SpecialPrediction[],
  specialResult: SpecialResult,
  settings: PointsSettings
): LeaderboardRow[] {
  const finishedMatches = matches.filter((m) => m.status === "finished");

  const rows: LeaderboardRow[] = users.map((user) => {
    let points = 0;
    let correctPredictions = 0;
    let totalPredictions = 0;

    for (const match of finishedMatches) {
      const prediction = predictions.find(
        (p) => p.userId === user.id && p.matchId === match.id
      );
      if (prediction) {
        totalPredictions += 1;
        const matchPoints = scoreMatchPrediction(match, prediction, settings);
        points += matchPoints;
        if (matchPoints > 0) correctPredictions += 1;
      }
    }

    const special = specialPredictions.find((sp) => sp.userId === user.id);
    points += scoreSpecialPrediction(special, specialResult, settings);

    const accuracy =
      totalPredictions > 0
        ? Math.round((correctPredictions / totalPredictions) * 100)
        : 0;

    return {
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      points,
      correctPredictions,
      totalPredictions,
      accuracy,
      position: 0,
    };
  });

  rows.sort((a, b) => b.points - a.points || b.accuracy - a.accuracy);
  rows.forEach((row, index) => {
    row.position = index + 1;
  });

  return rows;
}

/**
 * Compute per-round stats (best/worst round, exact scores, average points)
 * for a single user within a pool.
 */
export function buildUserStats(
  userId: string,
  matches: Match[],
  predictions: Prediction[],
  settings: PointsSettings
): UserStats {
  const finishedMatches = matches.filter((m) => m.status === "finished");
  const roundTotals = new Map<string, number>();
  let exactScoresCount = 0;
  let totalPoints = 0;
  let roundsWithPredictions = 0;

  const rounds = Array.from(new Set(finishedMatches.map((m) => m.round)));

  for (const round of rounds) {
    const roundMatches = finishedMatches.filter((m) => m.round === round);
    let roundPoints = 0;
    let hasPrediction = false;

    for (const match of roundMatches) {
      const prediction = predictions.find(
        (p) => p.userId === userId && p.matchId === match.id
      );
      if (!prediction) continue;
      hasPrediction = true;
      const points = scoreMatchPrediction(match, prediction, settings);
      roundPoints += points;
      if (
        points === settings.exactScore &&
        prediction.homeScore === match.homeScore &&
        prediction.awayScore === match.awayScore
      ) {
        exactScoresCount += 1;
      }
    }

    if (hasPrediction) {
      roundTotals.set(round, roundPoints);
      totalPoints += roundPoints;
      roundsWithPredictions += 1;
    }
  }

  let bestRound: RoundStat | undefined;
  let worstRound: RoundStat | undefined;
  for (const [round, points] of roundTotals.entries()) {
    if (!bestRound || points > bestRound.points) bestRound = { round, points };
    if (!worstRound || points < worstRound.points)
      worstRound = { round, points };
  }

  return {
    bestRound,
    worstRound,
    exactScoresCount,
    averagePoints:
      roundsWithPredictions > 0
        ? Math.round((totalPoints / roundsWithPredictions) * 10) / 10
        : 0,
  };
}

export function isPredictionLocked(match: Match, now: Date = new Date()): boolean {
  const kickoff = new Date(`${match.date}T${match.time}:00`);
  return now.getTime() >= kickoff.getTime() || match.status !== "upcoming";
}
