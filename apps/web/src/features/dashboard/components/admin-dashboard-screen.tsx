"use client";

import * as React from "react";
import { ArrowRight, Settings2, Play, Check, Wrench } from "lucide-react";
import { Link } from "@/i18n/routing";
import { AppShell } from "./app-shell";
import { MetricGrid } from "./metric-grid";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { PartnerStatsPanel } from "@/features/admin/components/partner-stats-panel";
import type { AdminMaintenanceLog } from "@/features/admin/types/admin.types";
import { LeadTable } from "@/features/leads/components/lead-table";
import { useAdminDashboard } from "../hooks/use-dashboard";
import { useAllMaintenanceLogs, useUpdateMaintenanceLogStatus } from "@/features/admin/hooks/use-admin-projects";

export function AdminDashboardScreen() {
  const auth = useAuthGuard("admin");
  const dashboard = useAdminDashboard();
  const maintLogsQuery = useAllMaintenanceLogs();
  const updateMaintStatusMutation = useUpdateMaintenanceLogStatus();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-12 py-4 px-1 font-sans text-foreground">
        
        {/* Command Center Title Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border/60">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Admin Command Center
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Portal Management GiLabs
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Pantau prospek dari mitra sales, tangani pengerjaan maintenance klien, dan kelola ekosistem portal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
            <Link
              href="/admin/leads"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Kelola Lead
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/admin/services"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-bold text-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Settings2 className="h-3.5 w-3.5" />
              CRUD Layanan
            </Link>
          </div>
        </section>

        {/* Quick Metrics */}
        {dashboard.isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        ) : (
          <MetricGrid metrics={dashboard.data?.summary ?? []} />
        )}

        {/* Client Maintenance Requests Section */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                Request Maintenance Klien
              </h2>
              <p className="text-xs text-muted-foreground">
                Laporan kendala, bug, dan pemeliharaan terbaru yang diajukan oleh klien.
              </p>
            </div>
            <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600">
              {maintLogsQuery.data?.filter((log) => log.status !== "completed").length ?? 0} Aktif
            </span>
          </div>

          {maintLogsQuery.isLoading ? (
            <div className="h-32 animate-pulse bg-muted rounded-md" />
          ) : maintLogsQuery.data && maintLogsQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                <thead className="bg-secondary text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="border-b border-border px-4 py-3">Project</th>
                    <th className="border-b border-border px-4 py-3">Deskripsi / Request</th>
                    <th className="border-b border-border px-4 py-3">Tanggal Request</th>
                    <th className="border-b border-border px-4 py-3 w-[120px]">Status</th>
                    <th className="border-b border-border px-4 py-3">PIC</th>
                    <th className="border-b border-border px-4 py-3 w-[100px] text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {maintLogsQuery.data.map((log: AdminMaintenanceLog) => (
                    <tr
                      key={log.id}
                      className="align-middle hover:bg-secondary/40 transition-colors"
                    >
                      <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                        {log.projectName || "GiLabs Project"}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-foreground font-medium max-w-[320px] truncate" title={log.description}>
                        {log.description}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {log.requestDate}
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                            log.status === "completed"
                              ? "bg-teal-500/10 text-teal-600"
                              : log.status === "in_progress"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {log.status === "in_progress" ? "In Progress" : log.status === "completed" ? "Selesai" : "Pending"}
                        </span>
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {log.picName || "-"}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {log.status === "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateMaintStatusMutation.mutate({
                                  logId: log.id,
                                  status: "in_progress",
                                })
                              }
                              title="Progres Maintenance"
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {log.status === "in_progress" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateMaintStatusMutation.mutate({
                                  logId: log.id,
                                  status: "completed",
                                })
                              }
                              title="Selesaikan / Done"
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-teal-600 hover:bg-secondary cursor-pointer transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {log.status === "completed" && (
                            <span className="text-[10px] text-muted-foreground/60 font-semibold px-2">
                              Selesai
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Tidak ada request maintenance aktif dari klien.
            </p>
          )}
        </section>

        {/* Leads & Partners Overview Stack */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">Lead Terbaru</h2>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <LeadTable leads={dashboard.data?.recentLeads ?? []} showPartner role="admin" />
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">Performa Mitra</h2>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <PartnerStatsPanel />
            </div>
          </section>
        </div>

      </div>
    </AppShell>
  );
}
