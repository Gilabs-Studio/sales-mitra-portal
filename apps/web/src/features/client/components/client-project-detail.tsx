"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Eye, Download } from "lucide-react";
import {
  useClientProjectDetail,
  useProjectProgress,
  useProjectDocuments,
  useProjectMaintenance,
  useProjectMaintenanceLogs,
  useProjectInvoices,
  useProjectReportData,
  useCreateMaintenanceRequest,
} from "../hooks/use-client";
import { formatCurrency, formatDate } from "@/lib/utils";

type TabType = "progress" | "deliverables" | "maintenance" | "invoice" | "reports";

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
  const progressQuery = useProjectProgress(projectId);
  const docsQuery = useProjectDocuments(projectId);
  const maintenanceQuery = useProjectMaintenance(projectId);
  const maintLogsQuery = useProjectMaintenanceLogs(projectId);
  const invoicesQuery = useProjectInvoices(projectId);
  const reportQuery = useProjectReportData(projectId);

  const requestMaintenanceMutation = useCreateMaintenanceRequest(projectId);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const project = projectQuery.data;

  // Handler for opening PDF preview
  const handlePreviewPdf = (url: string, title: string) => {
    setPreviewPdfUrl(url);
    setPreviewPdfTitle(title);
  };

  const handleDownloadReport = () => {
    window.print();
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

              {/* Progress Tab */}
              {activeTab === "progress" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-foreground">
                    Timeline Milestone Progres
                  </h3>
                  <div className="relative border-l border-border pl-6 ml-4 space-y-6">
                    {progressQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : progressQuery.data && progressQuery.data.length > 0 ? (
                      progressQuery.data.map((prog) => (
                        <div key={prog.id} className="relative">
                          <span
                            className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card ${
                              prog.status === "completed"
                                ? "bg-primary text-white"
                                : prog.status === "in_progress"
                                ? "bg-cyan-500 text-white"
                                : "bg-border text-muted-foreground"
                            }`}
                          />
                          <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-extrabold text-foreground">
                                  {prog.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Tanggal update: {prog.updateDate}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-primary">
                                  {prog.percentage}%
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                    prog.status === "completed"
                                      ? "bg-primary/10 text-primary"
                                      : prog.status === "in_progress"
                                      ? "bg-cyan-500/10 text-cyan-500"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {prog.status}
                                </span>
                              </div>
                            </div>
                            {prog.notes && (
                              <p className="mt-3 text-xs leading-relaxed text-muted-foreground bg-secondary/50 p-2.5 rounded border border-border/40">
                                {prog.notes}
                              </p>
                            )}
                            {prog.documentUrl && (
                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => handlePreviewPdf(prog.documentUrl!, prog.title)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                  title="Lihat PDF"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <a
                                  href={prog.documentUrl}
                                  download
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                  title="Unduh PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada progres timeline yang diupdate oleh admin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Deliverables Tab */}
              {activeTab === "deliverables" && (
                <div className="space-y-6">
                  {/* Deployment Links */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Informasi Deployment & Website
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {project?.websiteUrl && (
                        <div className="rounded-lg border border-border bg-secondary p-4 flex justify-between items-center transition-all hover:-translate-y-0.5">
                          <div>
                            <p className="text-xs text-muted-foreground">Website Utama (Production)</p>
                            <h4 className="mt-1 text-sm font-extrabold text-foreground line-clamp-1">
                              {project.websiteUrl}
                            </h4>
                          </div>
                          <a
                            href={project.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-primary hover:underline cursor-pointer"
                          >
                            Buka Situs
                          </a>
                        </div>
                      )}
                      {project?.stagingUrl && (
                        <div className="rounded-lg border border-border bg-secondary p-4 flex justify-between items-center transition-all hover:-translate-y-0.5">
                          <div>
                            <p className="text-xs text-muted-foreground">Staging / Development Website</p>
                            <h4 className="mt-1 text-sm font-extrabold text-foreground line-clamp-1">
                              {project.stagingUrl}
                            </h4>
                          </div>
                          <a
                            href={project.stagingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-primary hover:underline cursor-pointer"
                          >
                            Buka Situs
                          </a>
                        </div>
                      )}
                    </div>

                    {project?.credentials && (
                      <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
                        <h4 className="text-xs font-bold text-foreground">Informasi Akses & Credentials</h4>
                        <pre className="mt-2 text-xs leading-relaxed text-muted-foreground font-mono bg-card p-3 rounded border border-border overflow-x-auto whitespace-pre-wrap">
                          {project.credentials}
                        </pre>
                      </div>
                    )}

                    {project?.documentation && (
                      <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
                        <h4 className="text-xs font-bold text-foreground">Dokumentasi Tambahan</h4>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                          {project.documentation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Documents List */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Dokumen Serah Terima & Manual
                    </h3>
                    {docsQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : docsQuery.data && docsQuery.data.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {docsQuery.data.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex justify-between items-center py-3.5 transition-colors hover:bg-secondary/20 rounded-md px-2"
                          >
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{doc.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Diunggah pada: {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePreviewPdf(doc.documentUrl, doc.title)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                title="Lihat"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <a
                                href={doc.documentUrl}
                                download
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                title="Unduh"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada dokumen deliverables/BAST yang diunggah oleh admin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Maintenance Tab */}
              {activeTab === "maintenance" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-foreground">
                      Paket Maintenance
                    </h3>
                    {maintenanceQuery.data && maintenanceQuery.data.length > 0 && (
                      <button
                        onClick={() => {
                          const firstAvail = maintenanceQuery.data.find(m => m.quotaLimit - m.quotaUsed > 0);
                          setSelectedMaintId(firstAvail?.id ?? "");
                          setIsRequestMaintenanceOpen(true);
                        }}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        Ajukan Maintenance
                      </button>
                    )}
                  </div>

                  {/* Quota details list */}
                  {maintenanceQuery.isLoading ? (
                    <div className="h-32 animate-pulse bg-muted rounded-md" />
                  ) : maintenanceQuery.data && maintenanceQuery.data.length > 0 ? (
                    <div className="space-y-4">
                      {maintenanceQuery.data.map((maint) => (
                        <div key={maint.id} className="rounded-lg border border-border bg-card p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                                Paket Terdaftar
                              </span>
                              <h3 className="text-lg font-extrabold text-foreground mt-1">
                                {maint.packageName}
                              </h3>
                            </div>
                            <span className="rounded-full bg-teal-500/15 px-3 py-0.5 text-xs font-bold text-teal-600">
                              Aktif
                            </span>
                          </div>

                          <div className="mt-5">
                            <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                              <span>Pemakaian kuota maintenance tahunan</span>
                              <span className="font-extrabold text-foreground">
                                {maint.quotaUsed} / {maint.quotaLimit} Request
                              </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-border overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    (maint.quotaUsed / maint.quotaLimit) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
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

                  {/* Audit Logs Usage */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Histori Pemakaian Maintenance (Audit Log)
                    </h3>
                    {maintLogsQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : maintLogsQuery.data && maintLogsQuery.data.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {maintLogsQuery.data.map((ml) => (
                          <div key={ml.id} className="py-3 px-1 hover:bg-secondary/10 rounded-md">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-foreground">
                                  {ml.description}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                  <span>Tanggal: {ml.requestDate}</span>
                                  <span>·</span>
                                  <span>PIC Handler: {ml.picName}</span>
                                </div>
                              </div>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap ${
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
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada catatan pemakaian/request maintenance yang diajukan.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Invoice Tab */}
              {activeTab === "invoice" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-foreground">
                    Daftar Invoice & Pembayaran
                  </h3>
                  {invoicesQuery.isLoading ? (
                    <div className="h-32 animate-pulse bg-muted rounded-md" />
                  ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                      <ScrollArea orientation="horizontal">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                            <tr>
                              <th className="border-b border-border px-4 py-3">No. Invoice</th>
                              <th className="border-b border-border px-4 py-3">Nominal</th>
                              <th className="border-b border-border px-4 py-3">Tgl. Terbit</th>
                              <th className="border-b border-border px-4 py-3">Jatuh Tempo</th>
                              <th className="border-b border-border px-4 py-3">Status</th>
                              <th className="border-b border-border px-4 py-3">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoicesQuery.data.map((inv) => (
                              <tr
                                key={inv.id}
                                className="align-middle hover:bg-secondary/40 transition-colors"
                              >
                                <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                                  {inv.invoiceNumber}
                                </td>
                                <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                                  {formatCurrency(inv.amount)}
                                </td>
                                <td className="border-b border-border px-4 py-3 text-muted-foreground">
                                  {inv.issueDate}
                                </td>
                                <td className="border-b border-border px-4 py-3 text-muted-foreground">
                                  {inv.dueDate}
                                </td>
                                <td className="border-b border-border px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                                      inv.status === "paid"
                                        ? "bg-teal-500/10 text-teal-600"
                                        : inv.status === "waiting_payment"
                                        ? "bg-amber-500/10 text-amber-600"
                                        : inv.status === "overdue"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="border-b border-border px-4 py-3">
                                  {inv.documentUrl ? (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handlePreviewPdf(inv.documentUrl, `Invoice ${inv.invoiceNumber}`)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                        title="Lihat"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <a
                                        href={inv.documentUrl}
                                        download
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                        title="Unduh"
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No PDF</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </ScrollArea>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-6">
                      Belum ada invoice/billing yang diterbitkan untuk project ini.
                    </p>
                  )}
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === "reports" && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-2">
                      Laporan Perkembangan & Pemakaian Layanan
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Dapatkan rangkuman data progress, dokumen serah terima, penggunaan maintenance, dan riwayat tagihan invoice untuk kebutuhan pertanggungjawaban internal.
                    </p>
                    <button
                      onClick={handleDownloadReport}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      Cetak / Unduh Laporan Project
                    </button>
                  </div>

                  {/* Printable Audit History Frame */}
                  <div className="rounded-lg border border-border bg-card p-5" id="printable-report">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Log Aktivitas Transparansi Project
                    </h3>
                    {reportQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : reportQuery.data && reportQuery.data.history && reportQuery.data.history.length > 0 ? (
                      <div className="space-y-3">
                        {reportQuery.data.history.map((h: any) => (
                          <div key={h.id} className="text-xs leading-relaxed text-muted-foreground p-3 rounded-lg border border-border bg-secondary flex justify-between gap-4">
                            <div>
                              <p className="font-bold text-foreground">{h.details}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Oleh: {h.actorName} ({h.actorRole})</p>
                            </div>
                            <span className="text-[10px] whitespace-nowrap">
                              {formatDate(h.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada riwayat aktivitas yang tercatat.
                      </p>
                    )}
                  </div>
                </div>
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
                  {(requestMaintenanceMutation.error as any)?.response?.data?.message || (requestMaintenanceMutation.error as any)?.message || "Gagal mengirim request."}
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

      {/* PDF Preview Modal overlay */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/60 p-4">
          <div className="flex justify-between items-center bg-card p-3 rounded-t-lg border-b border-border shadow">
            <h3 className="text-sm font-extrabold text-foreground">{previewPdfTitle}</h3>
            <div className="flex gap-2">
              <a
                href={previewPdfUrl}
                download
                className="inline-flex min-h-8 items-center justify-center rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Unduh
              </a>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="inline-flex min-h-8 items-center justify-center rounded bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
          <div className="flex-1 bg-card overflow-hidden shadow-2xl relative">
            <iframe
              src={`${previewPdfUrl}`}
              className="w-full h-full border-0"
              title="PDF Handover Viewer"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
