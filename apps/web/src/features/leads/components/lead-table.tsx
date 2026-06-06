import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { Lead, LeadWithPartner } from "../types/lead.types";
import { serviceLabel } from "../utils/lead-labels";
import { StatusBadge } from "./status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type LeadTableProps<TLead extends Lead | LeadWithPartner> = {
  leads: TLead[];
  showPartner?: boolean;
  role?: "partner" | "admin";
  actions?: (lead: TLead) => React.ReactNode;
};

export function LeadTable<TLead extends Lead | LeadWithPartner>({
  leads,
  showPartner = false,
  role = "partner",
  actions,
}: LeadTableProps<TLead>) {
  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
        Belum ada lead untuk filter ini
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead className="bg-secondary text-xs uppercase text-muted-foreground">
          <tr>
            <th className="border-b border-border px-4 py-3">Perusahaan</th>
            {showPartner ? <th className="border-b border-border px-4 py-3">Mitra</th> : null}
            <th className="border-b border-border px-4 py-3">Layanan</th>
            <th className="border-b border-border px-4 py-3">Budget</th>
            <th className="border-b border-border px-4 py-3">Status</th>
            <th className="border-b border-border px-4 py-3">Score</th>
            <th className="border-b border-border px-4 py-3">Chat</th>
            <th className="border-b border-border px-4 py-3">Masuk</th>
            {actions ? <th className="border-b border-border px-4 py-3">Aksi</th> : null}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const detailHref = `/${role}/leads/${lead.id}` as `/${string}`;
            const hasUnread = lead.unreadCount > 0;

            return (
              <tr
                key={lead.id}
                className={cn("align-top transition-colors", hasUnread ? "bg-primary/5" : "")}
              >
                <td className="border-b border-border px-4 py-3">
                  <Link
                    href={detailHref}
                    className="cursor-pointer font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    {lead.companyName}
                  </Link>
                  <div className="text-xs leading-5 text-muted-foreground">
                    {lead.contactName} · {lead.contactEmail}
                  </div>
                  <div className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                    {lead.qualificationNote}
                  </div>
                </td>
                {showPartner ? (
                  <td className="border-b border-border px-4 py-3">
                    <div className="font-semibold text-foreground">
                      {"partnerName" in lead ? lead.partnerName : "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {"partnerCode" in lead ? lead.partnerCode : "-"}
                    </div>
                  </td>
                ) : null}
                <td className="border-b border-border px-4 py-3">{serviceLabel(lead.serviceType)}</td>
                <td className="border-b border-border px-4 py-3">
                  {lead.budget > 0 ? formatCurrency(lead.budget) : "Discovery"}
                </td>
                <td className="border-b border-border px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="border-b border-border px-4 py-3 font-semibold">
                  {lead.qualificationScore}
                </td>
                {/* Chat column */}
                <td className="border-b border-border px-4 py-3">
                  <Link
                    href={detailHref}
                    className="inline-flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-80"
                  >
                    <div className="relative">
                      <MessageCircle
                        className={cn("h-4 w-4", hasUnread ? "text-primary" : "text-muted-foreground")}
                      />
                      {hasUnread && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                          {lead.unreadCount > 9 ? "9+" : lead.unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        hasUnread ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {lead.messageCount}
                    </span>
                  </Link>
                </td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">
                  {formatDate(lead.createdAt)}
                </td>
                {actions ? (
                  <td className="border-b border-border px-4 py-3">{actions(lead)}</td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
