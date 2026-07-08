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
// WK Hockey 2026 data (teams + Phase 1 group matches) is the REAL, official
// schedule for the FIH Hockey World Cup 2026 (Belgium/Netherlands, 15-30 Aug
// 2026), reconstructed from the official fixture list published by the FIH
// (fih.hockey). Phase 2 (crossover), quarterfinals, semis, bronze and final
// are seeded by Phase 1 results and are not yet known - they'll be added via
// the admin panel once Phase 1 concludes, exactly like in real life.
// The Hoofdklasse and custom football league below remain illustrative
// sample data for the prototype.
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
// One entry fee covers both the women's and men's tournament; predictions,
// teams and leaderboards are kept fully separate via each team/match/pool's
// `division` field ("women" | "men").
export const WK_HOCKEY: Competition = {
  id: "comp-wk-hockey-2026",
  name: "FIH Hockey World Cup 2026",
  sportId: "sport-hockey",
  season: "2026",
  startDate: "2026-08-15",
  endDate: "2026-08-30",
  groups: ["Poule A", "Poule B", "Poule C", "Poule D"],
  isActive: true,
  isOfficial: true,
  entryFeeCents: 400,
  supportBeneficiaryName: "Oranje-Rood Dames 1",
  supportBeneficiaryDescription: "Teamfonds van Oranje-Rood Dames 1",
};

// --- Official competition #2: proves the platform isn't a one-tournament
// site - same sport, different level, opens after the World Cup. --------
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
  // FIH Hockey World Cup 2026 - Women (16 teams, Poules A-D)
  { id: "team-w-argentina", competitionId: WK_HOCKEY.id, name: "Argentinië", nameEn: "Argentina", country: "Argentinië", flagEmoji: "🇦🇷", division: "women" },
  { id: "team-w-australia", competitionId: WK_HOCKEY.id, name: "Australië", nameEn: "Australia", country: "Australië", flagEmoji: "🇦🇺", division: "women" },
  { id: "team-w-belgium", competitionId: WK_HOCKEY.id, name: "België", nameEn: "Belgium", country: "België", flagEmoji: "🇧🇪", division: "women" },
  { id: "team-w-chile", competitionId: WK_HOCKEY.id, name: "Chili", nameEn: "Chile", country: "Chili", flagEmoji: "🇨🇱", division: "women" },
  { id: "team-w-china", competitionId: WK_HOCKEY.id, name: "China", nameEn: "China", country: "China", flagEmoji: "🇨🇳", division: "women" },
  { id: "team-w-england", competitionId: WK_HOCKEY.id, name: "Engeland", nameEn: "England", country: "Engeland", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", division: "women" },
  { id: "team-w-germany", competitionId: WK_HOCKEY.id, name: "Duitsland", nameEn: "Germany", country: "Duitsland", flagEmoji: "🇩🇪", division: "women" },
  { id: "team-w-india", competitionId: WK_HOCKEY.id, name: "India", nameEn: "India", country: "India", flagEmoji: "🇮🇳", division: "women" },
  { id: "team-w-ireland", competitionId: WK_HOCKEY.id, name: "Ierland", nameEn: "Ireland", country: "Ierland", flagEmoji: "🇮🇪", division: "women" },
  { id: "team-w-japan", competitionId: WK_HOCKEY.id, name: "Japan", nameEn: "Japan", country: "Japan", flagEmoji: "🇯🇵", division: "women" },
  { id: "team-w-netherlands", competitionId: WK_HOCKEY.id, name: "Nederland", nameEn: "Netherlands", country: "Nederland", flagEmoji: "🇳🇱", division: "women" },
  { id: "team-w-new-zealand", competitionId: WK_HOCKEY.id, name: "Nieuw-Zeeland", nameEn: "New Zealand", country: "Nieuw-Zeeland", flagEmoji: "🇳🇿", division: "women" },
  { id: "team-w-scotland", competitionId: WK_HOCKEY.id, name: "Schotland", nameEn: "Scotland", country: "Schotland", flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", division: "women" },
  { id: "team-w-south-africa", competitionId: WK_HOCKEY.id, name: "Zuid-Afrika", nameEn: "South Africa", country: "Zuid-Afrika", flagEmoji: "🇿🇦", division: "women" },
  { id: "team-w-spain", competitionId: WK_HOCKEY.id, name: "Spanje", nameEn: "Spain", country: "Spanje", flagEmoji: "🇪🇸", division: "women" },
  { id: "team-w-united-states", competitionId: WK_HOCKEY.id, name: "Verenigde Staten", nameEn: "United States", country: "Verenigde Staten", flagEmoji: "🇺🇸", division: "women" },
  // FIH Hockey World Cup 2026 - Men (16 teams, Poules A-D)
  { id: "team-m-argentina", competitionId: WK_HOCKEY.id, name: "Argentinië", nameEn: "Argentina", country: "Argentinië", flagEmoji: "🇦🇷", division: "men" },
  { id: "team-m-australia", competitionId: WK_HOCKEY.id, name: "Australië", nameEn: "Australia", country: "Australië", flagEmoji: "🇦🇺", division: "men" },
  { id: "team-m-belgium", competitionId: WK_HOCKEY.id, name: "België", nameEn: "Belgium", country: "België", flagEmoji: "🇧🇪", division: "men" },
  { id: "team-m-england", competitionId: WK_HOCKEY.id, name: "Engeland", nameEn: "England", country: "Engeland", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", division: "men" },
  { id: "team-m-france", competitionId: WK_HOCKEY.id, name: "Frankrijk", nameEn: "France", country: "Frankrijk", flagEmoji: "🇫🇷", division: "men" },
  { id: "team-m-germany", competitionId: WK_HOCKEY.id, name: "Duitsland", nameEn: "Germany", country: "Duitsland", flagEmoji: "🇩🇪", division: "men" },
  { id: "team-m-india", competitionId: WK_HOCKEY.id, name: "India", nameEn: "India", country: "India", flagEmoji: "🇮🇳", division: "men" },
  { id: "team-m-ireland", competitionId: WK_HOCKEY.id, name: "Ierland", nameEn: "Ireland", country: "Ierland", flagEmoji: "🇮🇪", division: "men" },
  { id: "team-m-japan", competitionId: WK_HOCKEY.id, name: "Japan", nameEn: "Japan", country: "Japan", flagEmoji: "🇯🇵", division: "men" },
  { id: "team-m-malaysia", competitionId: WK_HOCKEY.id, name: "Maleisië", nameEn: "Malaysia", country: "Maleisië", flagEmoji: "🇲🇾", division: "men" },
  { id: "team-m-netherlands", competitionId: WK_HOCKEY.id, name: "Nederland", nameEn: "Netherlands", country: "Nederland", flagEmoji: "🇳🇱", division: "men" },
  { id: "team-m-new-zealand", competitionId: WK_HOCKEY.id, name: "Nieuw-Zeeland", nameEn: "New Zealand", country: "Nieuw-Zeeland", flagEmoji: "🇳🇿", division: "men" },
  { id: "team-m-pakistan", competitionId: WK_HOCKEY.id, name: "Pakistan", nameEn: "Pakistan", country: "Pakistan", flagEmoji: "🇵🇰", division: "men" },
  { id: "team-m-south-africa", competitionId: WK_HOCKEY.id, name: "Zuid-Afrika", nameEn: "South Africa", country: "Zuid-Afrika", flagEmoji: "🇿🇦", division: "men" },
  { id: "team-m-spain", competitionId: WK_HOCKEY.id, name: "Spanje", nameEn: "Spain", country: "Spanje", flagEmoji: "🇪🇸", division: "men" },
  { id: "team-m-wales", competitionId: WK_HOCKEY.id, name: "Wales", nameEn: "Wales", country: "Wales", flagEmoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", division: "men" },
  // Custom office football league
  { id: "team-noord", competitionId: CUSTOM_FOOTBALL.id, name: "Team Noord", country: "Kantoor", flagEmoji: "⚽" },
  { id: "team-zuid", competitionId: CUSTOM_FOOTBALL.id, name: "Team Zuid", country: "Kantoor", flagEmoji: "⚽" },
  { id: "team-oost", competitionId: CUSTOM_FOOTBALL.id, name: "Team Oost", country: "Kantoor", flagEmoji: "⚽" },
  { id: "team-west", competitionId: CUSTOM_FOOTBALL.id, name: "Team West", country: "Kantoor", flagEmoji: "⚽" },
];

const t = (id: string) => TEAMS.find((team) => team.id === id)!;

// Real FIH Hockey World Cup 2026 Phase 1 (group stage) fixtures.
export const MATCHES: Match[] = [
  // --- Women's Phase 1 group matches (24) ---
  { id: "m-w1", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-australia", awayTeamId: "team-w-japan", date: "2026-08-15", time: "10:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "women", status: "upcoming" },
  { id: "m-w3", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-netherlands", awayTeamId: "team-w-chile", date: "2026-08-15", time: "16:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "women", status: "upcoming" },
  { id: "m-w2", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-germany", awayTeamId: "team-w-scotland", date: "2026-08-15", time: "11:30", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "women", status: "upcoming" },
  { id: "m-w4", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-argentina", awayTeamId: "team-w-united-states", date: "2026-08-15", time: "17:30", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "women", status: "upcoming" },
  { id: "m-w5", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-england", awayTeamId: "team-w-south-africa", date: "2026-08-16", time: "10:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "women", status: "upcoming" },
  { id: "m-w6", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-china", awayTeamId: "team-w-india", date: "2026-08-16", time: "13:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "women", status: "upcoming" },
  { id: "m-w7", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-belgium", awayTeamId: "team-w-new-zealand", date: "2026-08-16", time: "17:30", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "women", status: "upcoming" },
  { id: "m-w8", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-spain", awayTeamId: "team-w-ireland", date: "2026-08-16", time: "20:30", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "women", status: "upcoming" },
  { id: "m-w9", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-chile", awayTeamId: "team-w-japan", date: "2026-08-17", time: "09:30", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "women", status: "upcoming" },
  { id: "m-w12", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-australia", awayTeamId: "team-w-netherlands", date: "2026-08-17", time: "18:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "women", status: "upcoming" },
  { id: "m-w10", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-united-states", awayTeamId: "team-w-scotland", date: "2026-08-17", time: "11:00", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "women", status: "upcoming" },
  { id: "m-w11", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-germany", awayTeamId: "team-w-argentina", date: "2026-08-17", time: "17:00", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "women", status: "upcoming" },
  { id: "m-w14", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-england", awayTeamId: "team-w-china", date: "2026-08-18", time: "12:30", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "women", status: "upcoming" },
  { id: "m-w15", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-india", awayTeamId: "team-w-south-africa", date: "2026-08-18", time: "15:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "women", status: "upcoming" },
  { id: "m-w13", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-new-zealand", awayTeamId: "team-w-ireland", date: "2026-08-18", time: "11:00", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "women", status: "upcoming" },
  { id: "m-w16", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-spain", awayTeamId: "team-w-belgium", date: "2026-08-18", time: "20:30", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "women", status: "upcoming" },
  { id: "m-w17", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-chile", awayTeamId: "team-w-australia", date: "2026-08-19", time: "09:30", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "women", status: "upcoming" },
  { id: "m-w20", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-netherlands", awayTeamId: "team-w-japan", date: "2026-08-19", time: "18:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "women", status: "upcoming" },
  { id: "m-w18", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-argentina", awayTeamId: "team-w-scotland", date: "2026-08-19", time: "11:00", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "women", status: "upcoming" },
  { id: "m-w19", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-united-states", awayTeamId: "team-w-germany", date: "2026-08-19", time: "14:00", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "women", status: "upcoming" },
  { id: "m-w21", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-china", awayTeamId: "team-w-south-africa", date: "2026-08-20", time: "09:30", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "women", status: "upcoming" },
  { id: "m-w23", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-india", awayTeamId: "team-w-england", date: "2026-08-20", time: "15:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "women", status: "upcoming" },
  { id: "m-w22", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-new-zealand", awayTeamId: "team-w-spain", date: "2026-08-20", time: "14:00", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "women", status: "upcoming" },
  { id: "m-w24", competitionId: WK_HOCKEY.id, homeTeamId: "team-w-belgium", awayTeamId: "team-w-ireland", date: "2026-08-20", time: "20:30", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "women", status: "upcoming" },
  // --- Men's Phase 1 group matches (24) ---
  { id: "m-m1", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-india", awayTeamId: "team-m-wales", date: "2026-08-15", time: "13:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "men", status: "upcoming" },
  { id: "m-m3", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-england", awayTeamId: "team-m-pakistan", date: "2026-08-15", time: "19:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "men", status: "upcoming" },
  { id: "m-m2", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-germany", awayTeamId: "team-m-malaysia", date: "2026-08-15", time: "14:30", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "men", status: "upcoming" },
  { id: "m-m4", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-belgium", awayTeamId: "team-m-france", date: "2026-08-15", time: "21:00", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "men", status: "upcoming" },
  { id: "m-m7", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-netherlands", awayTeamId: "team-m-new-zealand", date: "2026-08-16", time: "16:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "men", status: "upcoming" },
  { id: "m-m8", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-argentina", awayTeamId: "team-m-japan", date: "2026-08-16", time: "19:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "men", status: "upcoming" },
  { id: "m-m5", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-australia", awayTeamId: "team-m-ireland", date: "2026-08-16", time: "11:30", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "men", status: "upcoming" },
  { id: "m-m6", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-spain", awayTeamId: "team-m-south-africa", date: "2026-08-16", time: "14:30", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "men", status: "upcoming" },
  { id: "m-m9", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-pakistan", awayTeamId: "team-m-wales", date: "2026-08-17", time: "12:30", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "men", status: "upcoming" },
  { id: "m-m11", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-india", awayTeamId: "team-m-england", date: "2026-08-17", time: "15:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "men", status: "upcoming" },
  { id: "m-m10", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-france", awayTeamId: "team-m-malaysia", date: "2026-08-17", time: "14:00", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "men", status: "upcoming" },
  { id: "m-m12", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-germany", awayTeamId: "team-m-belgium", date: "2026-08-17", time: "20:30", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "men", status: "upcoming" },
  { id: "m-m13", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-new-zealand", awayTeamId: "team-m-japan", date: "2026-08-18", time: "09:30", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "men", status: "upcoming" },
  { id: "m-m16", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-argentina", awayTeamId: "team-m-netherlands", date: "2026-08-18", time: "18:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "men", status: "upcoming" },
  { id: "m-m14", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-spain", awayTeamId: "team-m-australia", date: "2026-08-18", time: "14:00", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "men", status: "upcoming" },
  { id: "m-m15", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-ireland", awayTeamId: "team-m-south-africa", date: "2026-08-18", time: "17:00", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "men", status: "upcoming" },
  { id: "m-m17", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-england", awayTeamId: "team-m-wales", date: "2026-08-19", time: "12:30", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "men", status: "upcoming" },
  { id: "m-m18", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-pakistan", awayTeamId: "team-m-india", date: "2026-08-19", time: "15:00", location: "Amstelveen (NED)", group: "Poule D", round: "Groepsfase - Poule D", division: "men", status: "upcoming" },
  { id: "m-m19", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-france", awayTeamId: "team-m-germany", date: "2026-08-19", time: "17:00", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "men", status: "upcoming" },
  { id: "m-m20", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-belgium", awayTeamId: "team-m-malaysia", date: "2026-08-19", time: "20:30", location: "Wavre (BEL)", group: "Poule B", round: "Groepsfase - Poule B", division: "men", status: "upcoming" },
  { id: "m-m22", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-new-zealand", awayTeamId: "team-m-argentina", date: "2026-08-20", time: "12:30", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "men", status: "upcoming" },
  { id: "m-m24", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-netherlands", awayTeamId: "team-m-japan", date: "2026-08-20", time: "18:00", location: "Amstelveen (NED)", group: "Poule A", round: "Groepsfase - Poule A", division: "men", status: "upcoming" },
  { id: "m-m21", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-australia", awayTeamId: "team-m-south-africa", date: "2026-08-20", time: "11:00", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "men", status: "upcoming" },
  { id: "m-m23", competitionId: WK_HOCKEY.id, homeTeamId: "team-m-ireland", awayTeamId: "team-m-spain", date: "2026-08-20", time: "17:00", location: "Wavre (BEL)", group: "Poule C", round: "Groepsfase - Poule C", division: "men", status: "upcoming" },
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

// One-time competition access (the EUR 4 entry fee for WK Hockey - covers
// both divisions). Free competitions (entryFeeCents === 0) don't need an
// access record - see hasCompetitionAccess() in pool-helpers.ts.
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
    id: "pool-national-women",
    name: "Officiële Poule — Vrouwen WK",
    visibility: "public",
    inviteCode: "WKVROUWEN",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-niels",
    isNational: true,
    division: "women",
    createdAt: "2026-06-01",
  },
  {
    id: "pool-national-men",
    name: "Officiële Poule — Mannen WK",
    visibility: "public",
    inviteCode: "WKMANNEN",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-niels",
    isNational: true,
    division: "men",
    createdAt: "2026-06-01",
  },
  {
    id: "pool-office",
    name: "Kantoor WK Poule (Mannen)",
    visibility: "private",
    inviteCode: "KANTOOR8",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-niels",
    division: "men",
    createdAt: "2026-06-05",
  },
  {
    id: "pool-achmea",
    name: "Achmea Verzekeringen — WK Poule (Vrouwen)",
    visibility: "private",
    inviteCode: "ACHMEA26",
    competitionId: WK_HOCKEY.id,
    ownerId: "u-fleur",
    isCompany: true,
    companyId: "company-achmea",
    division: "women",
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
  ...USERS.map((u): PoolMember => ({ poolId: "pool-national-women", userId: u.id, role: u.id === "u-niels" ? "owner" : "member", joinedAt: "2026-06-02" })),
  ...USERS.map((u): PoolMember => ({ poolId: "pool-national-men", userId: u.id, role: u.id === "u-niels" ? "owner" : "member", joinedAt: "2026-06-02" })),
  { poolId: "pool-office", userId: "u-niels", role: "owner", joinedAt: "2026-06-05" },
  { poolId: "pool-office", userId: "u-sanne", role: "member", joinedAt: "2026-06-06" },
  { poolId: "pool-office", userId: "u-milan", role: "member", joinedAt: "2026-06-07" },
  { poolId: "pool-achmea", userId: "u-fleur", role: "owner", joinedAt: "2026-06-01" },
  { poolId: "pool-achmea", userId: "u-daan", role: "member", joinedAt: "2026-06-08", department: "Sales" },
  { poolId: "pool-custom-football", userId: "u-niels", role: "owner", joinedAt: "2026-04-20" },
  { poolId: "pool-custom-football", userId: "u-milan", role: "member", joinedAt: "2026-04-21" },
];

// Deterministic "predicted" scorelines so every demo user already has
// predictions filled in for the (still upcoming) real World Cup matches.
// These are guesses, not results - the tournament hasn't started yet.
function guessScore(seed: number): number {
  return seed % 5; // 0-4
}

const wkMatches = MATCHES.filter((m) => m.competitionId === WK_HOCKEY.id);
const cfFinishedMatches = MATCHES.filter(
  (m) => m.competitionId === CUSTOM_FOOTBALL.id && m.status === "finished"
);

export const PREDICTIONS: Prediction[] = [
  ...USERS.flatMap((user, userIndex) =>
    wkMatches.map((match, matchIndex) => {
      const seed = userIndex * 7 + matchIndex;
      const poolId = match.division === "women" ? "pool-national-women" : "pool-national-men";
      return {
        id: `pred-${user.id}-${match.id}`,
        poolId,
        userId: user.id,
        matchId: match.id,
        homeScore: guessScore(seed),
        awayScore: guessScore(seed + 3),
        updatedAt: "2026-07-01",
      };
    })
  ),
  ...USERS.filter((u) => ["u-niels", "u-milan"].includes(u.id)).flatMap((user, userIndex) =>
    cfFinishedMatches.map((match, matchIndex) => {
      const seed = userIndex * 5 + matchIndex;
      const homeScore = userIndex === 0 ? match.homeScore! : guessScore(seed);
      const awayScore = userIndex === 0 ? match.awayScore! : guessScore(seed + 2);
      return {
        id: `pred-${user.id}-${match.id}`,
        poolId: "pool-custom-football",
        userId: user.id,
        matchId: match.id,
        homeScore,
        awayScore,
        updatedAt: "2026-05-07",
      };
    })
  ),
];

export const SPECIAL_PREDICTIONS: SpecialPrediction[] = [
  { poolId: "pool-national-women", userId: "u-niels", competitionId: WK_HOCKEY.id, championTeamId: "team-w-netherlands", finalistTeamIds: ["team-w-netherlands", "team-w-australia"], topscorerName: "Yibbi Jansen" },
  { poolId: "pool-national-women", userId: "u-sanne", competitionId: WK_HOCKEY.id, championTeamId: "team-w-australia", finalistTeamIds: ["team-w-netherlands", "team-w-australia"], topscorerName: "Maddie Hinch" },
  { poolId: "pool-national-men", userId: "u-niels", competitionId: WK_HOCKEY.id, championTeamId: "team-m-netherlands", finalistTeamIds: ["team-m-netherlands", "team-m-belgium"], topscorerName: "Jip Janssen" },
  { poolId: "pool-national-men", userId: "u-fleur", competitionId: WK_HOCKEY.id, championTeamId: "team-m-belgium", finalistTeamIds: ["team-m-netherlands", "team-m-belgium"], topscorerName: "Arthur van Doren" },
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
