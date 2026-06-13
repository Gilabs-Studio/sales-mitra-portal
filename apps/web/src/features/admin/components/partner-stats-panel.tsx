"use client";

import { useAdminPartners } from "../hooks/use-admin";

export function PartnerStatsPanel() {
  const partners = useAdminPartners({ page: 1, pageSize: 5 });

  return (
    <section className="rounded-lg bg-secondary/45 p-4.5">
      <h2 className="text-sm font-extrabold text-foreground">Mitra aktif</h2>
      <div className="mt-3.5 space-y-3">
        {partners.data?.data?.map((partner) => (
          <div key={partner.id} className="rounded-lg bg-card p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-foreground text-xs leading-none">{partner.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{partner.partnerCode}</p>
              </div>
              <p className="text-xs font-extrabold text-foreground shrink-0">{partner.totalLeads} lead</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-semibold text-muted-foreground">
              <span className="text-primary/70">Qualified {partner.qualifiedLeads}</span>
              <span className="text-success">Won {partner.wonLeads}</span>
              <span className="text-destructive">Rejected {partner.rejectedLeads}</span>
            </div>
          </div>
        ))}
        {partners.isLoading && (
          <p className="text-xs text-muted-foreground py-2">Memuat data mitra...</p>
        )}
        {!partners.isLoading && (partners.data?.data?.length ?? 0) === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Belum ada mitra</p>
        ) : null}
      </div>
    </section>
  );
}
