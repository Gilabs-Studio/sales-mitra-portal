"use client";

import { useAdminPartners } from "../hooks/use-admin";

export function PartnerStatsPanel() {
  const partners = useAdminPartners();

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-extrabold text-foreground">Mitra aktif</h2>
      <div className="mt-4 space-y-3">
        {partners.data?.map((partner) => (
          <div key={partner.id} className="rounded-lg border border-border bg-secondary p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{partner.name}</p>
                <p className="text-xs text-muted-foreground">{partner.partnerCode}</p>
              </div>
              <p className="text-sm font-extrabold text-foreground">{partner.totalLeads} lead</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <span>Qualified {partner.qualifiedLeads}</span>
              <span>Won {partner.wonLeads}</span>
              <span>Rejected {partner.rejectedLeads}</span>
            </div>
          </div>
        ))}
        {partners.data?.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada mitra</p> : null}
      </div>
    </section>
  );
}
