// Shared round-robin schedule generation, used both by the custom
// competition creation wizard (to preview matchups so the organizer can
// exclude specific ones) and by the store (to actually generate the
// matches). Keeping this in one place guarantees the preview and the real
// schedule always match up exactly.

export interface RoundRobinTeam {
  name: string;
  group?: string;
}

export interface RoundRobinMatchup {
  teamAName: string;
  teamBName: string;
  group?: string;
  leg: 1 | 2;
}

export function pairKey(nameA: string, nameB: string): string {
  return [nameA, nameB].sort().join("|||");
}

export function generateRoundRobinMatchups(
  teams: RoundRobinTeam[],
  roundRobinType: "single" | "double"
): RoundRobinMatchup[] {
  const groupNames = Array.from(new Set(teams.map((team) => team.group ?? "__all__")));
  const matchups: RoundRobinMatchup[] = [];

  for (const group of groupNames) {
    const groupTeams = teams.filter((team) => (team.group ?? "__all__") === group);
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        matchups.push({
          teamAName: groupTeams[i].name,
          teamBName: groupTeams[j].name,
          group: groupTeams[i].group,
          leg: 1,
        });
        if (roundRobinType === "double") {
          matchups.push({
            teamAName: groupTeams[j].name,
            teamBName: groupTeams[i].name,
            group: groupTeams[i].group,
            leg: 2,
          });
        }
      }
    }
  }

  return matchups;
}

// Default pool letters assigned round-robin-style across teams (A, B, C, A,
// B, C, ...) as a sensible starting point the organizer can override.
export function defaultGroupAssignment(teamCount: number, poolCount: number): (string | undefined)[] {
  if (poolCount <= 1) return Array(teamCount).fill(undefined);
  const letters = "ABCDEFGH".slice(0, poolCount).split("");
  return Array.from({ length: teamCount }, (_, i) => `Poule ${letters[i % poolCount]}`);
}
