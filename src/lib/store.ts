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
} from "@/data/mock-data";
import { DEFAULT_POINTS_SETTINGS } from "@/lib/scoring";
import { generateInviteCode, randomAvatarColor } from "@/lib/utils";

interface CreatePoolInput {
  name: string;
  competitionId: string;
  visibility: "public" | "private";
  division?: "women" | "men";
  logoUrl?: string;
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
  teams: { name: string; country?: string; flagEmoji?: string }[];
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

  currentUser: () => User | null;

  // auth
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateProfile: (name: string) => void;

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
    poolId: string,
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => void;
  setSpecialPrediction: (
    poolId: string,
    data: Partial<Omit<SpecialPrediction, "poolId" | "userId" | "competitionId">>
  ) => void;

  // admin
  updatePointsSettings: (poolId: string, settings: PointsSettings) => void;
  getPointsSettings: (poolId: string) => PointsSettings;
  adminUpdateMatch: (matchId: string, updates: Partial<Match>) => void;
  deletePool: (poolId: string) => void;
  toggleUserAdmin: (userId: string) => void;
  addSponsor: (name: string) => void;
  addPrize: (title: string, description: string) => void;
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

      updateProfile: (name) => {
        const { users, currentUserId } = get();
        set({
          users: users.map((u) =>
            u.id === currentUserId ? { ...u, name } : u
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

        const nationalPool = pools.find(
          (p) => p.competitionId === competitionId && p.isNational
        );
        const alreadyMember = nationalPool
          ? poolMembers.some((m) => m.poolId === nationalPool.id && m.userId === currentUserId)
          : false;

        set({
          competitionAccess: [...competitionAccess, access],
          poolMembers:
            nationalPool && !alreadyMember
              ? [
                  ...poolMembers,
                  {
                    poolId: nationalPool.id,
                    userId: currentUserId,
                    role: "member",
                    joinedAt: new Date().toISOString(),
                  },
                ]
              : poolMembers,
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
        set({
          companies: [...companies, company],
          pools: [...pools, pool],
          poolMembers: [
            ...poolMembers,
            { poolId, userId: ownerId, role: "owner", joinedAt: new Date().toISOString() },
          ],
          competitionAccess: [...competitionAccess, ownerAccess],
        });
        return company;
      },

      redeemCompanySeat: (code, department) => {
        const { companies, competitionAccess, currentUserId, poolMembers } = get();
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
        const alreadyMember = poolMembers.some(
          (m) => m.poolId === company.poolId && m.userId === currentUserId
        );

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
          poolMembers: alreadyMember
            ? poolMembers
            : [
                ...poolMembers,
                {
                  poolId: company.poolId,
                  userId: currentUserId,
                  role: "member",
                  joinedAt: new Date().toISOString(),
                  department,
                },
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
          entryFeeCents: 0,
          createdBy: currentUserId ?? undefined,
        };
        const newTeams: Team[] = input.teams.map((team, i) => ({
          id: `team-custom-${Date.now()}-${i}`,
          competitionId,
          name: team.name,
          country: team.country ?? "—",
          flagEmoji: team.flagEmoji ?? "🏳️",
        }));
        set({
          sports: nextSports,
          competitions: [...competitions, competition],
          teams: [...teams, ...newTeams],
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

      setMatchPrediction: (poolId, matchId, homeScore, awayScore) => {
        const { predictions, currentUserId } = get();
        if (!currentUserId) return;
        const id = `pred-${currentUserId}-${matchId}`;
        const existingIndex = predictions.findIndex((p) => p.id === id);
        const updated: Prediction = {
          id,
          poolId,
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

      setSpecialPrediction: (poolId, data) => {
        const { specialPredictions, currentUserId, pools } = get();
        if (!currentUserId) return;
        const pool = pools.find((p) => p.id === poolId);
        const existingIndex = specialPredictions.findIndex(
          (sp) => sp.poolId === poolId && sp.userId === currentUserId
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
                poolId,
                userId: currentUserId,
                competitionId: pool?.competitionId ?? "",
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
        const { pools, poolMembers, predictions, specialPredictions } = get();
        set({
          pools: pools.filter((p) => p.id !== poolId),
          poolMembers: poolMembers.filter((m) => m.poolId !== poolId),
          predictions: predictions.filter((p) => p.poolId !== poolId),
          specialPredictions: specialPredictions.filter((sp) => sp.poolId !== poolId),
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
    }),
    {
      name: "podium-storage",
      version: 2,
    }
  )
);
