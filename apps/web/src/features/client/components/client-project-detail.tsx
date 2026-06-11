"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { ApiClientError } from "@/lib/api-client";
import { ArrowLeft } from "lucide-react";
import {
  useClientProjectDetail,
  useProjectMaintenance,
  useCreateMaintenanceRequest,
} from "../hooks/use-client";
import { resolveAssetUrl } from "@/lib/asset-url";
import { ProjectPdfPreviewModal } from "./project-pdf-preview-modal";
import { ProjectTabPanelLoading } from "./project-tab-panel-loading";

type TabType = "progress" | "deliverables" | "maintenance" | "invoice" | "reports";

const ClientProjectProgressTab = dynamic(
  () => import("./client-project-progress-tab").then((mod) => mod.ClientProjectProgressTab),
  { loading: () => <ProjectTabPanelLoading />, ssr: false },
);

const ClientProjectDeliverablesTab = dynamic(
  () => import("./client-project-deliverables-tab").then((mod) => mod.ClientProjectDeliverablesTab),
  { loading: () => <ProjectTabPanelLoading />, ssr: false },
);

const ClientProjectMaintenanceTab = dynamic(
  () => import("./client-project-maintenance-tab").then((mod) => mod.ClientProjectMaintenanceTab),
  { loading: () => <ProjectTabPanelLoading />, ssr: false },
);

const ClientProjectInvoiceTab = dynamic(
  () => import("./client-project-invoice-tab").then((mod) => mod.ClientProjectInvoiceTab),
  { loading: () => <ProjectTabPanelLoading />, ssr: false },
);

const ClientProjectReportsTab = dynamic(
  () => import("./client-project-reports-tab").then((mod) => mod.ClientProjectReportsTab),
  { loading: () => <ProjectTabPanelLoading />, ssr: false },
);

export function ClientProjectDetail({ projectId }: { readonly projectId: string }) {
  const auth = useAuthGuard("client");
  const t = useTranslations("client");
  const [activeTab, setActiveTab] = React.useState<TabType>("progress");
  const [previewPdfUrl, setPreviewPdfUrl] = React.useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = React.useState<string>("");

  // Request Maintenance form state
  const [isRequestMaintenanceOpen, setIsRequestMaintenanceOpen] = React.useState(false);
  const [reqDescription, setReqDescription] = React.useState("");
  const [selectedMaintId, setSelectedMaintId] = React.useState("");

  const projectQuery = useClientProjectDetail(projectId);
  const maintenanceQuery = useProjectMaintenance(
    projectId,
    activeTab === "maintenance" || isRequestMaintenanceOpen,
  );

  const requestMaintenanceMutation = useCreateMaintenanceRequest(projectId);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const project = projectQuery.data;

  const handlePreviewPdf = (url: string, title: string) => {
    setPreviewPdfUrl(resolveAssetUrl(url));
    setPreviewPdfTitle(title);
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const handleOpenRequestMaintenance = (maintenanceId: string) => {
    setSelectedMaintId(maintenanceId);
    setIsRequestMaintenanceOpen(true);
  };

  const handleRequestMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDescription.trim() || !selectedMaintId) return;

    requestMaintenanceMutation.mutate(
      { description: reqDescription, maintenanceId: selectedMaintId },
      {
        onSuccess: () => {
          setReqDescription("");
          setSelectedMaintId("");
          setIsRequestMaintenanceOpen(false);
          alert("Request maintenance berhasil dikirim.");
        },
      }
    );
  };

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        {/* Back Link & Title */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/client/projects"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {project?.status}
              </span>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {project?.name}
              </h1>
            </div>
          </div>
        </div>

        {projectQuery.isLoading ? (
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        ) : projectQuery.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat detail project. Silakan coba kembali.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main Area (Tabs Content) */}
            <div className="space-y-6">
              {/* Tabs Buttons */}
              <div className="flex border-b border-border overflow-x-auto gap-2">
                {[
                  { id: "progress", label: t("projectProgress") },
                  { id: "deliverables", label: t("projectDeliverables") },
                  { id: "maintenance", label: t("projectMaintenance") },
                  { id: "invoice", label: t("projectInvoices") },
                  { id: "reports", label: t("projectReports") },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`border-b-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer hover:text-primary ${
                        active
                          ? "border-primary text-primary font-extrabold"
                          : "border-transparent text-muted-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === "progress" && (
                <ClientProjectProgressTab
                  projectId={projectId}
                  onPreviewPdf={handlePreviewPdf}
                />
              )}

              {activeTab === "deliverables" && (
                <ClientProjectDeliverablesTab
                  projectId={projectId}
                  project={project}
                  onPreviewPdf={handlePreviewPdf}
                />
              )}

              {activeTab === "maintenance" && (
                <ClientProjectMaintenanceTab
                  projectId={projectId}
                  onOpenRequestMaintenance={handleOpenRequestMaintenance}
                />
              )}

              {activeTab === "invoice" && (
                <ClientProjectInvoiceTab
                  projectId={projectId}
                  onPreviewPdf={handlePreviewPdf}
                />
              )}

              {activeTab === "reports" && (
                <ClientProjectReportsTab
                  projectId={projectId}
                  onDownloadReport={handleDownloadReport}
                />
              )}
            </div>

            {/* Right Sidebar (PIC & Metadata info) */}
            <aside className="space-y-6">
              {/* Project Info Panel */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider text-muted-foreground mb-4">
                  Metadata Project
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("startDate")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{project?.startDate}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("targetEndDate")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{project?.targetEndDate}</p>
                  </div>
                  <div className="border-t border-border/60 my-2" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("picName")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{project?.picName}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("picContact")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{project?.picContact}</p>
                  </div>
                </div>
              </div>

              {/* Description Panel */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-extrabold text-foreground mb-2">
                  Deskripsi Proyek
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {project?.description}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Request Maintenance Dialog Overlay */}
      {isRequestMaintenanceOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 px-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-extrabold text-foreground">Ajukan Request Maintenance</h2>
            <form onSubmit={handleRequestMaintenanceSubmit} className="mt-4 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="maint-select" className="text-xs font-bold text-muted-foreground uppercase">
                    Pilih Paket / Layanan
                  </label>
                  <select
                    id="maint-select"
                    required
                    value={selectedMaintId}
                    onChange={(e) => setSelectedMaintId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-1.5 text-sm focus-visible:outline-none cursor-pointer"
                  >
                    <option value="">-- Pilih Paket Maintenance --</option>
                    {maintenanceQuery.data?.map((m) => (
                      <option key={m.id} value={m.id} disabled={m.quotaUsed >= m.quotaLimit}>
                        {m.packageName} (Sisa: {m.quotaLimit - m.quotaUsed} request)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="req-desc" className="text-xs font-bold text-muted-foreground uppercase">
                    Deskripsi Masalah / Pekerjaan
                  </label>
                  <textarea
                    id="req-desc"
                    required
                    value={reqDescription}
                    onChange={(e) => setReqDescription(e.target.value)}
                    placeholder="Contoh: Perbaikan halaman checkout yang crash saat diklik..."
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-muted p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
              {requestMaintenanceMutation.isError && (
                <p className="text-xs font-bold text-destructive">
                  {requestMaintenanceMutation.error instanceof ApiClientError
                    ? requestMaintenanceMutation.error.message
                    : "Gagal mengirim request."}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsRequestMaintenanceOpen(false)}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={requestMaintenanceMutation.isPending || !selectedMaintId}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                >
                  {requestMaintenanceMutation.isPending ? "Mengirim..." : "Kirim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewPdfUrl && (
        <ProjectPdfPreviewModal
          title={previewPdfTitle}
          url={previewPdfUrl}
          onClose={() => setPreviewPdfUrl(null)}
        />
      )}
    </AppShell>
  );
}
