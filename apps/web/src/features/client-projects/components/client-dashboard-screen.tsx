"use client";

import { Bell, FileText, FolderKanban, ReceiptText, Wrench } from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { MetricGrid } from "@/features/dashboard/components/metric-grid";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useClientDashboard } from "../hooks/use-client-projects";
import { ProjectTable } from "./project-table";
import { StatusPill } from "./status-pill";
import { formatDateOnly } from "../utils/format";

export function ClientDashboardScreen() {
  const auth = useAuthGuard("client");
  const dashboard = useClientDashboard();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const data = dashboard.data;

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Client Portal</p>
            <h1 className="mt-2 text-4xl font-extrabold text-foreground">Portal GiLabs untuk project Anda</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pantau status delivery, dokumen, maintenance, invoice, dan update terbaru dari tim GiLabs dalam satu tempat.
            </p>
          </div>
          <aside className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
              Update terbaru
            </div>
            <div className="mt-4 space-y-3">
              {(data?.notifications ?? []).slice(0, 3).map((item) => (
                <div key={item.id} className="border-l border-border pl-3">
                  <p className="text-xs font-bold text-foreground">{activityLabel(item.action)}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description || "-"}</p>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{formatDate(item.createdAt)}</p>
                </div>
              ))}
              {(data?.notifications?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada update project.</p>
              ) : null}
            </div>
          </aside>
        </section>

        {dashboard.isError ? (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Dashboard client gagal dimuat.
          </div>
        ) : null}

        <MetricGrid metrics={data?.summary ?? []} />

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-foreground">Ringkasan project</h2>
          </div>
          <ProjectTable projects={data?.projects ?? []} role="client" />
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
              Maintenance aktif
            </div>
            <div className="mt-4 space-y-3">
              {(data?.maintenance ?? []).map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-secondary p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-foreground">{item.type}</p>
                    <span className="text-xs font-bold text-success">{item.quotaRemaining} sisa</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateOnly(item.periodStart)} - {formatDateOnly(item.periodEnd)}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
                    <div
                      className="h-full rounded-full bg-success"
                      style={{ width: `${item.quotaTotal ? Math.min(100, (item.quotaUsed / item.quotaTotal) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {(data?.maintenance?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada maintenance aktif.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              <ReceiptText className="h-4 w-4 text-primary" aria-hidden="true" />
              Invoice belum dibayar
            </div>
            <div className="mt-4 space-y-3">
              {(data?.unpaidInvoices ?? []).slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="rounded-lg border border-border bg-secondary p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground">{invoice.number}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Due {formatDateOnly(invoice.dueAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-foreground">{formatCurrency(invoice.amount)}</p>
                      <StatusPill type="invoice" status={invoice.status} className="mt-1" />
                    </div>
                  </div>
                </div>
              ))}
              {(data?.unpaidInvoices?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada invoice tertunggak.</p>
              ) : null}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            Reports tersedia di detail masing-masing project.
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function activityLabel(action: string) {
  const labels: Record<string, string> = {
    project_created: "Project dibuat",
    project_updated: "Project diperbarui",
    progress_updated: "Progress diperbarui",
    document_uploaded: "Dokumen baru",
    maintenance_plan_updated: "Maintenance diperbarui",
    maintenance_used: "Maintenance digunakan",
    invoice_created: "Invoice baru",
    invoice_updated: "Invoice diperbarui",
  };
  return labels[action] ?? action;
}
