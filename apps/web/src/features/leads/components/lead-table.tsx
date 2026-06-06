import type { Lead, LeadWithPartner } from "../types/lead.types";
import { serviceLabels } from "../utils/lead-labels";
import { StatusBadge } from "./status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

type LeadTableProps<TLead extends Lead | LeadWithPartner> = {
  leads: TLead[];
  showPartner?: boolean;
  actions?: (lead: TLead) => React.ReactNode;
};

export function LeadTable<TLead extends Lead | LeadWithPartner>({ leads, showPartner = false, actions }: LeadTableProps<TLead>) {
  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
        Belum ada lead untuk filter ini.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="bg-secondary text-xs uppercase text-muted-foreground">
          <tr>
            <th className="border-b border-border px-4 py-3">Perusahaan</th>
            {showPartner ? <th className="border-b border-border px-4 py-3">Mitra</th> : null}
            <th className="border-b border-border px-4 py-3">Layanan</th>
            <th className="border-b border-border px-4 py-3">Budget</th>
            <th className="border-b border-border px-4 py-3">Status</th>
            <th className="border-b border-border px-4 py-3">Score</th>
            <th className="border-b border-border px-4 py-3">Masuk</th>
            {actions ? <th className="border-b border-border px-4 py-3">Aksi</th> : null}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="align-top">
              <td className="border-b border-border px-4 py-3">
                <div className="font-semibold text-foreground">{lead.companyName}</div>
                <div className="text-xs leading-5 text-muted-foreground">
                  {lead.contactName} · {lead.contactEmail}
                </div>
                <div className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">{lead.qualificationNote}</div>
              </td>
              {showPartner ? (
                <td className="border-b border-border px-4 py-3">
                  <div className="font-semibold text-foreground">{"partnerName" in lead ? lead.partnerName : "-"}</div>
                  <div className="text-xs text-muted-foreground">{"partnerCode" in lead ? lead.partnerCode : "-"}</div>
                </td>
              ) : null}
              <td className="border-b border-border px-4 py-3">{serviceLabels[lead.serviceType]}</td>
              <td className="border-b border-border px-4 py-3">{lead.budget > 0 ? formatCurrency(lead.budget) : "Discovery"}</td>
              <td className="border-b border-border px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="border-b border-border px-4 py-3 font-semibold">{lead.qualificationScore}</td>
              <td className="border-b border-border px-4 py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
              {actions ? <td className="border-b border-border px-4 py-3">{actions(lead)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
