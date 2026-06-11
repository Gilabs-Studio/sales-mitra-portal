"use client";

import { useProjectMaintenance, useProjectMaintenanceLogs } from "../hooks/use-client";

type ClientProjectMaintenanceTabProps = {
  projectId: string;
  onOpenRequestMaintenance: (maintenanceId: string) => void;
};

export function ClientProjectMaintenanceTab({
  projectId,
  onOpenRequestMaintenance,
}: ClientProjectMaintenanceTabProps) {
  const maintenanceQuery = useProjectMaintenance(projectId);
  const maintLogsQuery = useProjectMaintenanceLogs(projectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-foreground">
          Paket Maintenance
        </h3>
        {maintenanceQuery.data && maintenanceQuery.data.length > 0 && (
          <button
            onClick={() => {
              const firstAvail = maintenanceQuery.data.find((m) => m.quotaLimit - m.quotaUsed > 0);
              onOpenRequestMaintenance(firstAvail?.id ?? "");
            }}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Ajukan Maintenance
          </button>
        )}
      </div>

      {maintenanceQuery.isLoading ? (
        <div className="h-32 animate-pulse rounded-md bg-muted" />
      ) : maintenanceQuery.data && maintenanceQuery.data.length > 0 ? (
        <div className="space-y-4">
          {maintenanceQuery.data.map((maint) => (
            <div key={maint.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                    Paket Terdaftar
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold text-foreground">
                    {maint.packageName}
                  </h3>
                </div>
                <span className="rounded-full bg-teal-500/15 px-3 py-0.5 text-xs font-bold text-teal-600">
                  Aktif
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-sm text-muted-foreground">
                  <span>Pemakaian kuota maintenance tahunan</span>
                  <span className="font-extrabold text-foreground">
                    {maint.quotaUsed} / {maint.quotaLimit} Request
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-500"
                    style={{
                      width: `${Math.min((maint.quotaUsed / maint.quotaLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col justify-between gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground sm:flex-row">
                <span>Sisa Kuota: <strong>{maint.quotaLimit - maint.quotaUsed} request</strong></span>
                <span>Periode Aktif: {maint.startDate} s/d {maint.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-5 text-center text-muted-foreground">
          Project Anda belum memiliki paket maintenance yang terdaftar.
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-md font-extrabold text-foreground">
          Histori Pemakaian Maintenance (Audit Log)
        </h3>
        {maintLogsQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        ) : maintLogsQuery.data && maintLogsQuery.data.length > 0 ? (
          <div className="divide-y divide-border/60">
            {maintLogsQuery.data.map((ml) => (
              <div key={ml.id} className="rounded-md px-1 py-3 hover:bg-secondary/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {ml.description}
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Tanggal: {ml.requestDate}</span>
                      <span>·</span>
                      <span>PIC Handler: {ml.picName}</span>
                    </div>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                      ml.status === "completed"
                        ? "bg-primary/15 text-primary"
                        : ml.status === "in_progress"
                          ? "bg-cyan-500/15 text-cyan-600"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ml.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Belum ada catatan pemakaian/request maintenance yang diajukan.
          </p>
        )}
      </div>
    </div>
  );
}
