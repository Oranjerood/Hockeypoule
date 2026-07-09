"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Trophy, Gift, Ticket, Heart, Upload } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import PaymentButton from "@/components/PaymentButton";
import PoolCard from "@/components/PoolCard";
import { useAppStore } from "@/lib/store";
import { getPoolsForUser, getMembersForPool, hasCompetitionAccess, computePoolLeaderboard, computeOverallStandings } from "@/lib/pool-helpers";
import LeaderboardTable from "@/components/pool/LeaderboardTable";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/utils";

const SUPPORT_PRESETS = [0, 200, 500, 1000, 2500];

function CompetitionHubContent() {
  const params = useParams<{ competitionId: string }>();
  const competitionId = params.competitionId;
  const t = useTranslations("Competitions");
  const tc = useTranslations("Common");
  const locale = useLocale();

  const currentUser = useAppStore((s) => s.currentUser());
  const sports = useAppStore((s) => s.sports);
  const competitions = useAppStore((s) => s.competitions);
  const competitionAccess = useAppStore((s) => s.competitionAccess);
  const pools = useAppStore((s) => s.pools);
  const poolMembers = useAppStore((s) => s.poolMembers);
  const users = useAppStore((s) => s.users);
  const predictions = useAppStore((s) => s.predictions);
  const specialPredictions = useAppStore((s) => s.specialPredictions);
  const matches = useAppStore((s) => s.matches);
  const teams = useAppStore((s) => s.teams);
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const purchaseCompetitionAccess = useAppStore((s) => s.purchaseCompetitionAccess);
  const createCompany = useAppStore((s) => s.createCompany);
  const redeemCompanySeat = useAppStore((s) => s.redeemCompanySeat);

  const [payFor, setPayFor] = useState<"self" | "group" | null>(null);
  const [supportAmount, setSupportAmount] = useState(0);
  const [customSupport, setCustomSupport] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | undefined>();
  const [companySeats, setCompanySeats] = useState(10);
  const [companyResult, setCompanyResult] = useState<{ inviteCode: string } | null>(null);
  const [inviteContacts, setInviteContacts] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemError, setRedeemError] = useState("");

  const competition = competitions.find((c) => c.id === competitionId);

  if (!competition || !currentUser) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted">Competitie niet gevonden.</p>
        <Button href="/dashboard" className="mt-4">Terug naar dashboard</Button>
      </div>
    );
  }

  const sport = sports.find((s) => s.id === competition.sportId);
  const canAccess = hasCompetitionAccess(competition, competitionAccess, currentUser.id);
  const totalAmountCents = competition.entryFeeCents + supportAmount;

  if (competition.comingSoon) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-2xl">{sport?.emoji}</span>
        </div>
        <h1 className="mt-4 text-xl font-bold">{competition.name}</h1>
        <Badge tone="neutral" className="mt-2">{tc("comingSoon")}</Badge>
        <p className="mt-3 text-sm text-muted">{t("comingSoonText")}</p>
        <Button href="/dashboard" variant="outline" className="mt-6">Terug naar dashboard</Button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
            {sport?.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{competition.name}</h1>
            <p className="text-sm text-muted">{sport?.name} · {competition.season}</p>
          </div>
        </div>

        <Card className="mt-6 p-6">
          <h2 className="font-semibold">{t("accessTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("accessText")}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setPayFor("self")}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                payFor === "self" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span className="font-semibold">Alleen voor mezelf</span>
              <p className="mt-1 text-sm text-muted">
                Jij betaalt {formatCurrency(competition.entryFeeCents, locale)} en doet zelf mee.
              </p>
            </button>
            <button
              onClick={() => setPayFor("group")}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                payFor === "group" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <Gift size={15} className="text-primary" /> {t("companyOption")}
              </span>
              <p className="mt-1 text-sm text-muted">{t("companyOptionText")}</p>
            </button>
          </div>

          {payFor === "self" && (
            <div className="mt-6 border-t border-border pt-6">
              <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3 text-sm">
                <span className="text-muted">{t("entryFee")}</span>
                <span className="font-semibold">{formatCurrency(competition.entryFeeCents, locale)}</span>
              </div>

              {competition.supportBeneficiaryName && (
                <div className="mt-4">
                  <Label className="flex items-center gap-1.5">
                    <Heart size={13} className="text-primary" />
                    {t("supportLabel", { beneficiary: competition.supportBeneficiaryName })}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORT_PRESETS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => { setSupportAmount(amount); setCustomSupport(""); }}
                        className={`rounded-full border px-3 py-1.5 text-sm ${
                          supportAmount === amount && !customSupport
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted"
                        }`}
                      >
                        {amount === 0 ? t("noExtra") : `+${formatCurrency(amount, locale)}`}
                      </button>
                    ))}
                    <input
                      placeholder={t("customAmount")}
                      value={customSupport}
                      onChange={(e) => {
                        setCustomSupport(e.target.value);
                        setSupportAmount(Math.round(Number(e.target.value || 0) * 100));
                      }}
                      className="w-28 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">{t("supportNote")}</p>
                </div>
              )}

              <div className="mt-6">
                <PaymentButton
                  amountLabel={formatCurrency(totalAmountCents, locale)}
                  onPaid={() => purchaseCompetitionAccess(competitionId, supportAmount)}
                />
              </div>
            </div>
          )}

          {payFor === "group" && !companyResult && (
            <div className="mt-6 space-y-3 border-t border-border pt-6">
              <div>
                <Label>{t("companyGroupName")}</Label>
                <Input
                  placeholder={t("companyGroupNamePlaceholder")}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("companyLogo")}</Label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted hover:border-primary hover:text-primary">
                  {companyLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={companyLogo} alt="logo" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <Upload size={18} />
                  )}
                  {t("companyUploadLogo")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setCompanyLogo(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <div>
                <Label>{t("companySeatsLabel")}</Label>
                <input
                  type="number"
                  min={1}
                  value={companySeats}
                  onChange={(e) => setCompanySeats(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                />
                {companySeats > 15 && (
                  <p className="mt-1.5 text-xs text-muted">{t("bulkDiscountNote")}</p>
                )}
              </div>

              {competition.supportBeneficiaryName && (
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Heart size={13} className="text-primary" />
                    {t("supportLabel", { beneficiary: competition.supportBeneficiaryName })}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORT_PRESETS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => { setSupportAmount(amount); setCustomSupport(""); }}
                        className={`rounded-full border px-3 py-1.5 text-sm ${
                          supportAmount === amount && !customSupport
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted"
                        }`}
                      >
                        {amount === 0 ? t("noExtra") : `+${formatCurrency(amount, locale)}`}
                      </button>
                    ))}
                    <input
                      placeholder={t("customAmount")}
                      value={customSupport}
                      onChange={(e) => {
                        setCustomSupport(e.target.value);
                        setSupportAmount(Math.round(Number(e.target.value || 0) * 100));
                      }}
                      className="w-28 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">{t("supportNote")}</p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3 text-sm">
                <span className="text-muted">Totaalprijs</span>
                <span className="font-semibold">
                  {formatCurrency(competition.entryFeeCents * companySeats + supportAmount, locale)}
                </span>
              </div>
              <PaymentButton
                amountLabel={formatCurrency(competition.entryFeeCents * companySeats + supportAmount, locale)}
                onPaid={() => {
                  const company = createCompany({
                    name: companyName || "Mijn groep",
                    competitionId,
                    seats: companySeats,
                    logoUrl: companyLogo,
                  });
                  setCompanyResult({ inviteCode: company.inviteCode });
                }}
              />
            </div>
          )}

          {companyResult && (
            <div className="mt-4 space-y-4 rounded-xl bg-success/10 p-4 text-sm">
              <div>
                <p className="font-medium text-success">{t("companyResultTitle")}</p>
                <p className="mt-1 text-muted">{t("companyResultText")}</p>
                <p className="mt-2 font-mono text-base font-bold">{companyResult.inviteCode}</p>
              </div>

              <div className="border-t border-success/20 pt-4">
                <Label>E-mailadressen of telefoonnummers (één per regel)</Label>
                <textarea
                  value={inviteContacts}
                  onChange={(e) => setInviteContacts(e.target.value)}
                  placeholder={"naam1@bedrijf.nl\nnaam2@bedrijf.nl\n06-12345678"}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                />
                <p className="mt-1 text-xs text-muted">
                  E-mailadressen kan je direct uitnodigen. Telefoonnummers zet je zelf in je
                  WhatsApp/SMS-bericht — plak de code erbij.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const emails = inviteContacts
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter((line) => line.includes("@"));
                      const subject = encodeURIComponent("Doe mee aan de WK Hockey poule!");
                      const body = encodeURIComponent(
                        `Je bent uitgenodigd voor onze WK Hockey poule. Gebruik deze code om gratis mee te doen: ${companyResult.inviteCode}`
                      );
                      window.location.href = `mailto:?bcc=${emails.join(",")}&subject=${subject}&body=${body}`;
                    }}
                  >
                    Open e-mail met uitnodiging
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="mt-4 p-6">
          <div className="flex items-center gap-2">
            <Ticket size={18} className="text-primary" />
            <h2 className="font-semibold">{t("redeemSeat")}</h2>
          </div>
          <p className="mt-1 text-sm text-muted">{t("redeemSeatText")}</p>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder={t("redeemCode")}
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            />
            <Button
              onClick={() => {
                const company = redeemCompanySeat(redeemCode);
                if (!company) setRedeemError("Ongeldige of volle bedrijfscode.");
              }}
            >
              {t("redeemButton")}
            </Button>
          </div>
          {redeemError && <p className="mt-2 text-sm text-danger">{redeemError}</p>}
        </Card>
      </div>
    );
  }

  const myPools = getPoolsForUser(pools, poolMembers, currentUser.id).filter(
    ({ pool }) => pool.competitionId === competitionId
  );

  const womensNationalPool = pools.find(
    (p) => p.competitionId === competitionId && p.isNational && p.division === "women"
  );
  const mensNationalPool = pools.find(
    (p) => p.competitionId === competitionId && p.isNational && p.division === "men"
  );
  const overallStandings =
    womensNationalPool && mensNationalPool
      ? computeOverallStandings(
          womensNationalPool,
          mensNationalPool,
          poolMembers,
          users,
          predictions,
          specialPredictions,
          getPointsSettings(womensNationalPool.id),
          getPointsSettings(mensNationalPool.id),
          matches
        )
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
          {sport?.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{competition.name}</h1>
          <p className="text-sm text-muted">
            {competition.isOfficial ? t("hubSubtitle") : t("customSubtitle")} · {sport?.name}
          </p>
        </div>
      </div>

      {overallStandings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Totaalklassement — vrouwen + mannen samen
          </h2>
          <p className="mt-1 text-sm text-muted">
            Wie in de officiële poule van beide toernooien meedoet, telt hier gecombineerd mee.
          </p>
          <div className="mt-4">
            <LeaderboardTable rows={overallStandings} currentUserId={currentUser.id} />
          </div>
        </div>
      )}

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("yourPools")}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myPools.map(({ pool, role }) => {
          const memberCount = getMembersForPool(poolMembers, pool.id).length;
          const settings = getPointsSettings(pool.id);
          const leaderboard = computePoolLeaderboard(
            pool, poolMembers, users, predictions, specialPredictions, settings, matches
          );
          const myRow = leaderboard.find((r) => r.userId === currentUser.id);
          const countryTeam = pool.countryTeamIds?.length ? teams.find((tm) => pool.countryTeamIds!.includes(tm.id)) : undefined;
          return (
            <PoolCard
              key={pool.id}
              pool={pool}
              memberCount={memberCount}
              role={role}
              position={myRow?.position}
              countryTeam={countryTeam}
            />
          );
        })}

        <Link href={{ pathname: "/pools/create", query: { competitionId } }}>
          <Card className="flex h-full min-h-[168px] flex-col items-center justify-center gap-2 border-dashed p-6 text-center transition-shadow hover:shadow-md">
            <Trophy size={24} className="text-primary" />
            <span className="font-medium">{t("createPoolFree")}</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function CompetitionHubPage() {
  return (
    <RequireAuth>
      <CompetitionHubContent />
    </RequireAuth>
  );
}
