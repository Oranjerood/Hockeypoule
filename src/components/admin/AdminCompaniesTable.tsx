import Badge from "../ui/Badge";
import type { Company, CompetitionAccess } from "@/types";

export default function AdminCompaniesTable({
  companies,
  competitionAccess,
}: {
  companies: Company[];
  competitionAccess: CompetitionAccess[];
}) {
  return (
    <div className="space-y-2">
      {companies.map((company) => {
        const seatsUsed = competitionAccess.filter((a) => a.companyId === company.id).length;
        return (
          <div key={company.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div>
              <p className="font-medium">{company.name}</p>
              <p className="text-xs text-muted">Code: {company.inviteCode}</p>
            </div>
            <Badge tone={seatsUsed >= company.seatsPurchased ? "warning" : "primary"}>
              {seatsUsed} / {company.seatsPurchased} zitplaatsen gebruikt
            </Badge>
          </div>
        );
      })}
      {companies.length === 0 && <p className="text-sm text-muted">Nog geen bedrijven.</p>}
    </div>
  );
}
