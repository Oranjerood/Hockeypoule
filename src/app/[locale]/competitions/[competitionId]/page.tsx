"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Trophy, Building2, Ticket, Heart } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import PaymentButton from "@/components/PaymentButton";
import PoolCard from "@/components/PoolCard";
import { useAppStore } from "@/lib/store";
import { getPoolsForUser, getMembersForPool, hasCompetitionAccess, computePoolLeaderboard } from "@/lib/pool-helpers";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/utils";

const SUPPORT_PRESETS = [0, 500, 1000, 2500];

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
  const getPointsSettings = useAppStore((s) => s.getPointsSettings);
  const purchaseCompetitionAccess = useAppStore((s) => s.purchaseCompetitionAccess);
  const createCompany = useAppStore((s) => s.createCompany);
  const redeemCompanySeat = useAppStore((s) => s.redeemCompanySeat);

  const [supportAmount, setSupportAmount] = useState(0);
  const [customSupport, setCustomSupport] = useState("");
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companySeats, setCompanySeats] = useState(10);
  const [companyResult, setCompanyResult] = useState<{ inviteCode: string } | null>(null);
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

          <div className="mt-4 flex items-center justify-between rounded-xl bg-background px-4 py-3 text-sm">
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
            </div>
          )}

          <div className="mt-6">
            <PaymentButton
              amountLabel={formatCurrency(totalAmountCents, locale)}
              onPaid={() => purchaseCompetitionAccess(competitionId, supportAmount)}
            />
          </div>
        </Card>

        <Card className="mt-4 p-6">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <h2 className="font-semibold">{t("companyOption")}</h2>
          </div>
          <p className="mt-1 text-sm text-muted">{t("companyOptionText")}</p>

          {!showCompanyForm && !companyResult && (
            <Button variant="outline" className="mt-4" onClick={() => setShowCompanyForm(true)}>
              {t("companyOption")}
            </Button>
          )}

          {showCompanyForm && !companyResult && (
            <div className="mt-4 space-y-3">
              <div>
                <Label>Bedrijfsnaam</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div>
                <Label>Aantal medewerkers</Label>
                <input
                  type="number"
                  min={1}
                  value={companySeats}
                  onChange={(e) => setCompanySeats(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3 text-sm">
                <span className="text-muted">Totaalprijs</span>
                <span className="font-semibold">
                  {formatCurrency(competition.entryFeeCents * companySeats, locale)}
                </span>
              </div>
              <PaymentButton
                amountLabel={formatCurrency(competition.entryFeeCents * companySeats, locale)}
                onPaid={() => {
                  const company = createCompany({
                    name: companyName || "Mijn bedrijf",
                    competitionId,
                    seats: companySeats,
                  });
                  setCompanyResult({ inviteCode: company.inviteCode });
                }}
              />
            </div>
          )}

          {companyResult && (
            <div className="mt-4 rounded-xl bg-success/10 p-4 text-sm">
              <p className="font-medium text-success">Bedrijfspoule aangemaakt 🎉</p>
              <p className="mt-1 text-muted">
                Deel deze code met je collega&apos;s zodat zij gratis kunnen meedoen:
              </p>
              <p className="mt-2 font-mono text-base font-bold">{companyResult.inviteCode}</p>
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
          return (
            <PoolCard
              key={pool.id}
              pool={pool}
              memberCount={memberCount}
              role={role}
              position={myRow?.position}
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
