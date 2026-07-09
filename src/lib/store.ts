"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  Pool,
  PoolMember,
  Prediction,
  SpecialPrediction,
  PointsSettings,
  Match,
  Competition,
  Team,
  CompetitionAccess,
  Company,
  Sponsor,
  Prize,
  Sport,
  Division,
  ChatMessage,
  Player,
} from "@/types";
import {
  USERS,
  POOLS,
  POOL_MEMBERS,
  PREDICTIONS,
  SPECIAL_PREDICTIONS,
  COMPETITIONS,
  MATCHES,
  TEAMS,
  COMPETITION_ACCESS,
  COMPANIES,
  SPONSORS,
  PRIZES,
  SPORTS,
  PLAYERS,
} from "@/data/mock-data";
import { DEFAULT_POINTS_SETTINGS } from "@/lib/scoring";
import { generateInviteCode, randomAvatarColor } from "@/lib/utils";
import { generateRoundRobinMatchups, pairKey } from "@/lib/round-robin";

interface CreatePoolInput {
  name: string;
  competitionId: string;
  visibility: "public" | "private";
  division?: "women" | "men";
  logoUrl?: string;
  countryTeamIds?: string[];
}

interface CreateCompanyInput {
  name: string;
  competitionId: string;
  seats: number;
  logoUrl?: string;
  primaryColor?: string;
}

interface CustomCompetitionInput {
  name: string;
  sportId: string;
  customSportName?: string;
  season: string;
  teams: { name: string; group?: string }[];
  roundRobinType?: "single" | "double";
  excludedPairKeys?: string[];
  startDate?: string;
  startTime?: string;
  location?: string;
}

interface AppState {
  currentUserId: string | null;
  theme: "light" | "dark";
  users: User[];
  sports: Sport[];
  competitions: Competition[];
  teams: Team[];
  matches: Match[];
  pools: Pool[];
  poolMembers: PoolMember[];
  predictions: Prediction[];
  specialPredictions: SpecialPrediction[];
  pointsSettingsByPool: Record<string, PointsSettings>;
  competitionAccess: CompetitionAccess[];
  companies: Company[];
  sponsors: Sponsor[];
  prizes: Prize[];
  chatMessages: ChatMessage[];
  players: Player[];

  currentUser: () => User | null;

  // auth
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateProfile: (name: string, avatarPhotoUrl?: string) => void;

  // theme
  setTheme: (theme: "light" | "dark") => void;

  // competition access / payments (Mollie-stub gated)
  purchaseCompetitionAccess: (competitionId: string, supportAmountCents: number) => void;
  createCompany: (input: CreateCompanyInput) => Company;
  redeemCompanySeat: (code: string, department?: string) => Company | null;

  // custom competitions
  createCustomCompetition: (input: CustomCompetitionInput) => Competition;
  addMatchToCompetition: (
    competitionId: string,
    match: { homeTeamId: string; awayTeamId: string; date: string; time: string; round: string; location?: string }
  ) => void;

  // pools
  createPool: (input: CreatePoolInput) => Pool;
  joinPoolByCode: (code: string) => Pool | null;

  // predictions
  setMatchPrediction: (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => void;
  setSpecialPrediction: (
    competitionId: string,
    division: Division | undefined,
    data: Partial<Omit<SpecialPrediction, "userId" | "competitionId" | "division">>
  ) => void;

  // admin
  updatePointsSettings: (poolId: string, settings: PointsSettings) => void;
  getPointsSettings: (poolId: string) => PointsSettings;
  adminUpdateMatch: (matchId: string, updates: Partial<Match>) => void;
  deletePool: (poolId: string) => void;
  toggleUserAdmin: (userId: string) => void;
  addSponsor: (name: string) => void;
  addPrize: (title: string, description: string) => void;
  sendChatMessage: (poolId: string, text: string) => void;
  setSquad: (teamId: string, playerNames: string[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      theme: "light",
      users: USERS,
      sports: SPORTS,
      competitions: COMPETITIONS,
      teams: TEAMS,
      matches: MATCHES,
      pools: POOLS,
      poolMembers: POOL_MEMBERS,
      predictions: PREDICTIONS,
      specialPredictions: SPECIAL_PREDICTIONS,
      pointsSettingsByPool: {},
      competitionAccess: COMPETITION_ACCESS,
      companies: COMPANIES,
      sponsors: SPONSORS,
      prizes: PRIZES,
      chatMessages: [],
      players: PLAYERS,

      currentUser: () => {
        const { currentUserId, users } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      login: (email, name) => {
        const { users } = get();
        const existing = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
          set({ currentUserId: existing.id });
          return;
        }
        const newUser: User = {
          id: `u-${Date.now()}`,
          name: name?.trim() || email.split("@")[0],
          email,
          avatarColor: randomAvatarColor(),
        };
        set({ users: [...users, newUser], currentUserId: newUser.id });
      },

      logout: () => set({ currentUserId: null }),

      updateProfile: (name, avatarPhotoUrl) => {
        const { users, currentUserId } = get();
        set({
          users: users.map((u) =>
            u.id === currentUserId
              ? { ...u, name, ...(avatarPhotoUrl !== undefined ? { avatarPhotoUrl } : {}) }
              : u
          ),
        });
      },

      setTheme: (theme) => set({ theme }),

      purchaseCompetitionAccess: (competitionId, supportAmountCents) => {
        const { currentUserId, competitions, competitionAccess, pools, poolMembers } = get();
        if (!currentUserId) return;
        const competition = competitions.find((c) => c.id === competitionId);
        if (!competition) return;

        const access: CompetitionAccess = {
          id: `acc-${Date.now()}`,
          competitionId,
          userId: currentUserId,
          baseAmountCents: competition.entryFeeCents,
          supportAmountCents,
          purchasedAt: new Date().toISOString(),
        };

        // A competition can have more than one official pool (e.g. a
        // separate women's and men's national pool) - join all of them,
        // not just the first one found.
        const nationalPools = pools.filter(
          (p) => p.competitionId === competitionId && p.isNational
        );
        const newMemberships: PoolMember[] = nationalPools
          .filter(
            (pool) =>
              !poolMembers.some((m) => m.poolId === pool.id && m.userId === currentUserId)
          )
          .map((pool) => ({
            poolId: pool.id,
            userId: currentUserId,
            role: "member" as const,
            joinedAt: new Date().toISOString(),
          }));

        set({
          competitionAccess: [...competitionAccess, access],
          poolMembers: [...poolMembers, ...newMemberships],
        });
      },

      createCompany: (input) => {
        const { currentUserId, companies, pools, poolMembers, competitionAccess } = get();
        const ownerId = currentUserId ?? "guest";
        const poolId = `pool-company-${Date.now()}`;
        const company: Company = {
          id: `company-${Date.now()}`,
          name: input.name,
          logoUrl: input.logoUrl,
          primaryColor: input.primaryColor,
          competitionId: input.competitionId,
          ownerId,
          seatsPurchased: input.seats,
          inviteCode: generateInviteCode(),
          poolId,
          createdAt: new Date().toISOString(),
        };
        const pool: Pool = {
          id: poolId,
          name: `${input.name} — Poule`,
          visibility: "private",
          inviteCode: company.inviteCode,
          competitionId: input.competitionId,
          ownerId,
          isCompany: true,
          companyId: company.id,
          createdAt: new Date().toISOString(),
        };
        const ownerAccess: CompetitionAccess = {
          id: `acc-${Date.now()}`,
          competitionId: input.competitionId,
          userId: ownerId,
          baseAmountCents: 0,
          supportAmountCents: 0,
          companyId: company.id,
          purchasedAt: new Date().toISOString(),
        };
        const nationalPools = pools.filter(
          (p) => p.competitionId === input.competitionId && p.isNational
        );
        const nationalMemberships: PoolMember[] = nationalPools
          .filter((p) => !poolMembers.some((m) => m.poolId === p.id && m.userId === ownerId))
          .map((p) => ({
            poolId: p.id,
            userId: ownerId,
            role: "member" as const,
            joinedAt: new Date().toISOString(),
          }));

        set({
          companies: [...companies, company],
          pools: [...pools, pool],
          poolMembers: [
            ...poolMembers,
            { poolId, userId: ownerId, role: "owner", joinedAt: new Date().toISOString() },
            ...nationalMemberships,
          ],
          competitionAccess: [...competitionAccess, ownerAccess],
        });
        return company;
      },

      redeemCompanySeat: (code, department) => {
        const { companies, competitionAccess, currentUserId, poolMembers, pools } = get();
        if (!currentUserId) return null;
        const company = companies.find(
          (c) => c.inviteCode.toLowerCase() === code.trim().toLowerCase()
        );
        if (!company) return null;

        const seatsUsed = competitionAccess.filter((a) => a.companyId === company.id).length;
        if (seatsUsed >= company.seatsPurchased) return null;

        const alreadyHasAccess = competitionAccess.some(
          (a) => a.competitionId === company.competitionId && a.userId === currentUserId
        );
        const alreadyMemberOfCompanyPool = poolMembers.some(
          (m) => m.poolId === company.poolId && m.userId === currentUserId
        );

        const nationalPools = pools.filter(
          (p) => p.competitionId === company.competitionId && p.isNational
        );
        const newNationalMemberships: PoolMember[] = nationalPools
          .filter((p) => !poolMembers.some((m) => m.poolId === p.id && m.userId === currentUserId))
          .map((p) => ({
            poolId: p.id,
            userId: currentUserId,
            role: "member" as const,
            joinedAt: new Date().toISOString(),
          }));

        set({
          competitionAccess: alreadyHasAccess
            ? competitionAccess
            : [
                ...competitionAccess,
                {
                  id: `acc-${Date.now()}`,
                  competitionId: company.competitionId,
                  userId: currentUserId,
                  baseAmountCents: 0,
                  supportAmountCents: 0,
                  companyId: company.id,
                  purchasedAt: new Date().toISOString(),
                },
              ],
          poolMembers: [
            ...poolMembers,
            ...(alreadyMemberOfCompanyPool
              ? []
              : [
                  {
                    poolId: company.poolId,
                    userId: currentUserId,
                    role: "member" as const,
                    joinedAt: new Date().toISOString(),
                    department,
                  },
                ]),
            ...newNationalMemberships,
          ],
        });
        return company;
      },

      createCustomCompetition: (input) => {
        const { currentUserId, competitions, teams, sports } = get();
        const competitionId = `comp-custom-${Date.now()}`;
        let sportId = input.sportId;
        let nextSports = sports;
        if (sportId === "custom") {
          const label = input.customSportName?.trim() || "Overig";
          sportId = `sport-custom-${Date.now()}`;
          nextSports = [...sports, { id: sportId, name: label, slug: sportId, emoji: "🏆" }];
        }
        const competition: Competition = {
          id: competitionId,
          name: input.name,
          sportId,
          season: input.season,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
          groups: [],
          isActive: true,
          isOfficial: false,
          // Same one-time entry fee model as the official competitions: the
          // creator (and everyone who later joins) pays once for unlimited
          // pools within this competition.
          entryFeeCents: 400,
          createdBy: currentUserId ?? undefined,
        };

        // Teams are plain club/company/friend-group teams here, not national
        // teams, so there's no real country/flag - just a name and whichever
        // pool/group the organizer assigned it to (the actual real-world
        // draw, not something we invent).
        const newTeams: Team[] = input.teams.map((team, i) => ({
          id: `team-custom-${Date.now()}-${i}`,
          competitionId,
          name: team.name,
          country: team.name,
          flagEmoji: "🏳️",
          group: team.group,
        }));
        const nameToId = new Map(newTeams.map((team) => [team.name, team.id]));

        const startDate = input.startDate || competition.startDate;
        const startTime = input.startTime || "12:00";
        const excludedPairs = new Set(input.excludedPairKeys ?? []);

        // Generate the round-robin schedule per pool (everyone plays everyone
        // once, or twice home-and-away if requested), then drop any specific
        // matchups the organizer excluded (not every team has to play every
        // other team).
        const matchups = generateRoundRobinMatchups(
          newTeams.map((team) => ({ name: team.name, group: team.group })),
          input.roundRobinType ?? "single"
        );

        const newMatches: Match[] = [];
        let matchCounter = 0;
        for (const matchup of matchups) {
          if (excludedPairs.has(pairKey(matchup.teamAName, matchup.teamBName))) continue;
          const homeTeamId = nameToId.get(matchup.teamAName);
          const awayTeamId = nameToId.get(matchup.teamBName);
          if (!homeTeamId || !awayTeamId) continue;
          matchCounter += 1;
          newMatches.push({
            id: `match-custom-${Date.now()}-${matchCounter}`,
            competitionId,
            homeTeamId,
            awayTeamId,
            date: startDate,
            time: startTime,
            location: input.location ?? "",
            group: matchup.group,
            round: matchup.group
              ? `Groepsfase - ${matchup.group}${matchup.leg === 2 ? " (return)" : ""}`
              : `Groepsfase${matchup.leg === 2 ? " (return)" : ""}`,
            status: "upcoming",
          });
        }

        set({
          sports: nextSports,
          competitions: [...competitions, competition],
          teams: [...teams, ...newTeams],
          matches: [...get().matches, ...newMatches],
        });
        return competition;
      },

      addMatchToCompetition: (competitionId, matchInput) => {
        const { matches } = get();
        const match: Match = {
          id: `match-custom-${Date.now()}`,
          competitionId,
          homeTeamId: matchInput.homeTeamId,
          awayTeamId: matchInput.awayTeamId,
          date: matchInput.date,
          time: matchInput.time,
          location: matchInput.location ?? "",
          round: matchInput.round,
          status: "upcoming",
        };
        set({ matches: [...matches, match] });
      },

      createPool: (input) => {
        const { currentUserId, pools, poolMembers } = get();
        const ownerId = currentUserId ?? "guest";
        const newPool: Pool = {
          id: `pool-${Date.now()}`,
          name: input.name,
          visibility: input.visibility,
          inviteCode: generateInviteCode(),
          competitionId: input.competitionId,
          ownerId,
          division: input.division,
          logoUrl: input.logoUrl,
          countryTeamIds: input.countryTeamIds,
          createdAt: new Date().toISOString(),
        };
        const newMember: PoolMember = {
          poolId: newPool.id,
          userId: ownerId,
          role: "owner",
          joinedAt: new Date().toISOString(),
        };
        set({
          pools: [...pools, newPool],
          poolMembers: [...poolMembers, newMember],
        });
        return newPool;
      },

      joinPoolByCode: (code) => {
        const { pools, poolMembers, currentUserId } = get();
        const pool = pools.find(
          (p) => p.inviteCode.toLowerCase() === code.trim().toLowerCase()
        );
        if (!pool || !currentUserId) return null;
        const alreadyMember = poolMembers.some(
          (m) => m.poolId === pool.id && m.userId === currentUserId
        );
        if (!alreadyMember) {
          const newMember: PoolMember = {
            poolId: pool.id,
            userId: currentUserId,
            role: "member",
            joinedAt: new Date().toISOString(),
          };
          set({ poolMembers: [...poolMembers, newMember] });
        }
        return pool;
      },

      setMatchPrediction: (matchId, homeScore, awayScore) => {
        const { predictions, currentUserId } = get();
        if (!currentUserId) return;
        const id = `pred-${currentUserId}-${matchId}`;
        const existingIndex = predictions.findIndex((p) => p.id === id);
        const updated: Prediction = {
          id,
          userId: currentUserId,
          matchId,
          homeScore,
          awayScore,
          updatedAt: new Date().toISOString(),
        };
        if (existingIndex >= 0) {
          const next = [...predictions];
          next[existingIndex] = updated;
          set({ predictions: next });
        } else {
          set({ predictions: [...predictions, updated] });
        }
      },

      setSpecialPrediction: (competitionId, division, data) => {
        const { specialPredictions, currentUserId } = get();
        if (!currentUserId) return;
        const existingIndex = specialPredictions.findIndex(
          (sp) =>
            sp.competitionId === competitionId &&
            sp.division === division &&
            sp.userId === currentUserId
        );
        if (existingIndex >= 0) {
          const next = [...specialPredictions];
          next[existingIndex] = { ...next[existingIndex], ...data };
          set({ specialPredictions: next });
        } else {
          set({
            specialPredictions: [
              ...specialPredictions,
              {
                userId: currentUserId,
                competitionId,
                division,
                ...data,
              },
            ],
          });
        }
      },

      updatePointsSettings: (poolId, settings) => {
        set({
          pointsSettingsByPool: {
            ...get().pointsSettingsByPool,
            [poolId]: settings,
          },
        });
      },

      getPointsSettings: (poolId) => {
        return get().pointsSettingsByPool[poolId] ?? DEFAULT_POINTS_SETTINGS;
      },

      adminUpdateMatch: (matchId, updates) => {
        const { matches } = get();
        set({
          matches: matches.map((m) => (m.id === matchId ? { ...m, ...updates } : m)),
        });
      },

      deletePool: (poolId) => {
        const { pools, poolMembers, chatMessages } = get();
        // Predictions are shared across pools for the same competition, so
        // deleting a pool only removes the pool, its memberships and chat.
        set({
          pools: pools.filter((p) => p.id !== poolId),
          poolMembers: poolMembers.filter((m) => m.poolId !== poolId),
          chatMessages: chatMessages.filter((m) => m.poolId !== poolId),
        });
      },

      toggleUserAdmin: (userId) => {
        const { users } = get();
        set({
          users: users.map((u) => (u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u)),
        });
      },

      addSponsor: (name) => {
        const { sponsors } = get();
        set({ sponsors: [...sponsors, { id: `sponsor-${Date.now()}`, name }] });
      },

      addPrize: (title, description) => {
        const { prizes } = get();
        set({ prizes: [...prizes, { id: `prize-${Date.now()}`, title, description }] });
      },

      sendChatMessage: (poolId, text) => {
        const { chatMessages, currentUserId } = get();
        if (!currentUserId || !text.trim()) return;
        set({
          chatMessages: [
            ...chatMessages,
            {
              id: `chat-${Date.now()}`,
              poolId,
              userId: currentUserId,
              text: text.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        });
      },

      setSquad: (teamId, playerNames) => {
        const { players } = get();
        const withoutTeam = players.filter((p) => p.teamId !== teamId);
        const newPlayers: Player[] = playerNames
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name, i) => ({ id: `player-${teamId}-${Date.now()}-${i}`, teamId, name }));
        set({ players: [...withoutTeam, ...newPlayers] });
      },
    }),
    {
      name: "hockeypoule-storage-v3",
      version: 3,
    }
  )
);
