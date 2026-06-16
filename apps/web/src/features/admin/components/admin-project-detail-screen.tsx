"use client";

import * as React from "react";
import {
  ArrowLeft,
  CalendarDays,
  Settings,
  Clock,
  Layers,
  Wrench,
  FileText,
  Save,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import {
  useProjectDetail,
  useUpdateProject,
  useCreateProjectProgress,
  useDeleteProjectProgress,
  useCreateProjectDocument,
  useDeleteProjectDocument,
  useCreateProjectMaintenance,
  useUpdateProjectMaintenance,
  useDeleteProjectMaintenance,
  useCreateMaintenanceLog,
  useDeleteMaintenanceLog,
  useCreateProjectInvoice,
  useUpdateProjectInvoice,
  useDeleteProjectInvoice,
  useUpdateProjectProgress,
} from "../hooks/use-admin-projects";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { NumericInput } from "@/components/ui/numeric-input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUpload } from "@/components/ui/file-upload";
import { resolveAssetUrl } from "@/lib/asset-url";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  InvoiceStatus,
  MaintenanceLog,
  ProgressStatus,
  Project,
  ProjectDocument,
  ProjectInvoice,
  ProjectMaintenance,
  ProjectProgress,
  ProjectStatus,
} from "@/features/client/types/client.types";

type TabType = "info" | "progress" | "docs" | "maintenance" | "invoice";

type AdminProjectDetailData = {
  project?: Project;
  progress?: ProjectProgress[];
  documents?: ProjectDocument[];
  maintenance?: ProjectMaintenance[];
  maintLogs?: MaintenanceLog[];
  invoices?: ProjectInvoice[];
};

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateInput(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  const parsed = parseDateInput(value);
  if (!parsed) return "Pilih tanggal";
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AdminProjectDetailScreen({ projectId }: { readonly projectId: string }) {
  const auth = useAuthGuard("admin");
  const [activeTab, setActiveTab] = React.useState<TabType>("info");

  // Queries/Mutations
  const projectQuery = useProjectDetail(projectId);
  const updateProjectMutation = useUpdateProject(projectId);
  const createProgressMutation = useCreateProjectProgress(projectId);
  const deleteProgressMutation = useDeleteProjectProgress(projectId);
  const createDocMutation = useCreateProjectDocument(projectId);
  const deleteDocMutation = useDeleteProjectDocument(projectId);
  const createMaintMutation = useCreateProjectMaintenance(projectId);
  const updateMaintMutation = useUpdateProjectMaintenance(projectId);
  const deleteMaintMutation = useDeleteProjectMaintenance(projectId);
  const createMaintLogMutation = useCreateMaintenanceLog(projectId);
  const deleteMaintLogMutation = useDeleteMaintenanceLog(projectId);
  const createInvoiceMutation = useCreateProjectInvoice(projectId);
  const updateInvoiceMutation = useUpdateProjectInvoice(projectId);
  const deleteInvoiceMutation = useDeleteProjectInvoice(projectId);
  const updateProgressMutation = useUpdateProjectProgress(projectId);

  // Modal / Delete dialog states
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteContext, setDeleteContext] = React.useState<{ type: string; id: string; name: string } | null>(null);

  // Modal dialog open/close states
  const [isCreateProgressOpen, setIsCreateProgressOpen] = React.useState(false);
  const [isEditProgressOpen, setIsEditProgressOpen] = React.useState(false);
  const [editingProgressItem, setEditingProgressItem] = React.useState<ProjectProgress | null>(null);
  const [isCreateDocOpen, setIsCreateDocOpen] = React.useState(false);
  const [isCreateMaintLogOpen, setIsCreateMaintLogOpen] = React.useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = React.useState(false);
  const [isMaintSetupOpen, setIsMaintSetupOpen] = React.useState(false);
  const [editingMaintItem, setEditingMaintItem] = React.useState<ProjectMaintenance | null>(null);

  // Edit Project Info form states
  const [name, setName] = React.useState<string | undefined>(undefined);
  const [description, setDescription] = React.useState<string | undefined>(undefined);
  const [picName, setPicName] = React.useState<string | undefined>(undefined);
  const [picContact, setPicContact] = React.useState<string | undefined>(undefined);
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined);
  const [targetEndDate, setTargetEndDate] = React.useState<string | undefined>(undefined);
  const [status, setStatus] = React.useState<ProjectStatus | undefined>(undefined);
  const [websiteUrl, setWebsiteUrl] = React.useState<string | undefined>(undefined);
  const [stagingUrl, setStagingUrl] = React.useState<string | undefined>(undefined);
  const [credentials, setCredentials] = React.useState<string | undefined>(undefined);
  const [documentation, setDocumentation] = React.useState<string | undefined>(undefined);

  // Milestone Form
  const [milestoneTitle, setMilestoneTitle] = React.useState("");
  const [milestoneStatus, setMilestoneStatus] = React.useState<ProgressStatus>("pending");
  const [milestonePercent, setMilestonePercent] = React.useState(0);
  const [milestoneNotes, setMilestoneNotes] = React.useState("");
  const [milestoneDoc, setMilestoneDoc] = React.useState("");

  // Document Form
  const [docTitle, setDocTitle] = React.useState("");
  const [docUrl, setDocUrl] = React.useState("");

  // Maintenance Package Form
  const [maintPackage, setMaintPackage] = React.useState("");
  const [maintLimit, setMaintLimit] = React.useState(12);
  const [maintDuration, setMaintDuration] = React.useState("1");

  // Maintenance usage log form
  const [logDesc, setLogDesc] = React.useState("");
  const [logStatus, setLogStatus] = React.useState<ProgressStatus>("pending");
  const [logPic, setLogPic] = React.useState("");
  const [selectedMaintLogId, setSelectedMaintLogId] = React.useState("");

  // Invoice Form
  const [invNum, setInvNum] = React.useState("");
  const [invAmount, setInvAmount] = React.useState(0);
  const [invStatus, setInvStatus] = React.useState<InvoiceStatus>("draft");
  const [invIssueDate, setInvIssueDate] = React.useState("");
  const [invDueDate, setInvDueDate] = React.useState("");
  const [invDoc, setInvDoc] = React.useState("");
  const [showIssueCalendar, setShowIssueCalendar] = React.useState(false);
  const [showDueCalendar, setShowDueCalendar] = React.useState(false);
  const issueCalendarRef = React.useRef<HTMLDivElement | null>(null);
  const dueCalendarRef = React.useRef<HTMLDivElement | null>(null);

  const data = projectQuery.data as AdminProjectDetailData | undefined;

  React.useEffect(() => {
    if (!showIssueCalendar && !showDueCalendar) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (showIssueCalendar && issueCalendarRef.current && !issueCalendarRef.current.contains(target)) {
        setShowIssueCalendar(false);
      }

      if (showDueCalendar && dueCalendarRef.current && !dueCalendarRef.current.contains(target)) {
        setShowDueCalendar(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showIssueCalendar, showDueCalendar]);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  // Submit metadata updates
  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate({
      name: name ?? data?.project?.name ?? "",
      description: description ?? data?.project?.description ?? "",
      picName: picName ?? data?.project?.picName ?? "",
      picContact: picContact ?? data?.project?.picContact ?? "",
      startDate: startDate ?? data?.project?.startDate ?? "",
      targetEndDate: targetEndDate ?? data?.project?.targetEndDate ?? "",
      status: status ?? data?.project?.status ?? "discovery",
      websiteUrl: websiteUrl ?? data?.project?.websiteUrl ?? "",
      stagingUrl: stagingUrl ?? data?.project?.stagingUrl ?? "",
      credentials: credentials ?? data?.project?.credentials ?? "",
      documentation: documentation ?? data?.project?.documentation ?? "",
    }, {
      onSuccess: () => alert("Informasi project berhasil diperbarui."),
    });
  };

  const handleEditProgressTrigger = (item: ProjectProgress) => {
    setEditingProgressItem(item);
    setMilestoneTitle(item.title);
    setMilestoneStatus(item.status);
    setMilestonePercent(item.percentage);
    setMilestoneNotes(item.notes ?? "");
    setMilestoneDoc(item.documentUrl ?? "");
    setIsEditProgressOpen(true);
  };

  // Submit new milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    createProgressMutation.mutate({
      title: milestoneTitle,
      status: milestoneStatus,
      percentage: Number(milestonePercent),
      notes: milestoneNotes,
      documentUrl: milestoneDoc,
    }, {
      onSuccess: () => {
        setMilestoneTitle("");
        setMilestoneNotes("");
        setMilestoneDoc("");
        setMilestonePercent(0);
        setMilestoneStatus("pending");
        setIsCreateProgressOpen(false);
      },
    });
  };

  // Update milestone
  const handleUpdateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgressItem || !milestoneTitle.trim()) return;

    updateProgressMutation.mutate({
      progressId: editingProgressItem.id,
      payload: {
        title: milestoneTitle,
        status: milestoneStatus,
        percentage: Number(milestonePercent),
        notes: milestoneNotes,
        documentUrl: milestoneDoc,
      },
    }, {
      onSuccess: () => {
        setMilestoneTitle("");
        setMilestoneNotes("");
        setMilestoneDoc("");
        setMilestonePercent(0);
        setMilestoneStatus("pending");
        setEditingProgressItem(null);
        setIsEditProgressOpen(false);
      },
    });
  };

  // Submit new document deliverable
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docUrl.trim()) return;

    createDocMutation.mutate({
      title: docTitle,
      documentUrl: docUrl,
    }, {
      onSuccess: () => {
        setDocTitle("");
        setDocUrl("");
        setIsCreateDocOpen(false);
      },
    });
  };

  // Save/setup maintenance
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintPackage.trim()) return;

    const getDatesForDuration = (durationMonths: number) => {
      const start = new Date();
      const end = new Date();
      end.setMonth(start.getMonth() + durationMonths);
      
      const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      
      return {
        startDate: formatDate(start),
        endDate: formatDate(end)
      };
    };

    const durationMonths = Number(maintDuration);
    const { startDate, endDate } = getDatesForDuration(durationMonths);

    const payload = {
      packageName: maintPackage,
      startDate,
      endDate,
      quotaLimit: Number(maintLimit),
      quotaUsed: editingMaintItem ? Number(editingMaintItem.quotaUsed) : 0,
    };

    if (editingMaintItem) {
      updateMaintMutation.mutate({
        maintId: editingMaintItem.id,
        payload,
      }, {
        onSuccess: () => {
        setIsMaintSetupOpen(false);
        setEditingMaintItem(null);
        setMaintPackage("");
        setMaintDuration("1");
        setMaintLimit(12);
        },
      });
    } else {
      createMaintMutation.mutate(payload, {
        onSuccess: () => {
          setIsMaintSetupOpen(false);
          setMaintPackage("");
          setMaintDuration("1");
          setMaintLimit(12);
        },
      });
    }
  };

  // Add maintenance request usage log
  const handleAddMaintLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDesc.trim() || !logPic.trim() || !selectedMaintLogId) return;

    createMaintLogMutation.mutate({
      description: logDesc,
      status: logStatus,
      picName: logPic,
      maintenanceId: selectedMaintLogId,
      requestDate: new Date().toISOString().split("T")[0],
    }, {
      onSuccess: () => {
        setLogDesc("");
        setLogPic("");
        setLogStatus("pending");
        setSelectedMaintLogId("");
        setIsCreateMaintLogOpen(false);
      },
    });
  };

  // Add Invoice
  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invNum.trim() || invAmount <= 0 || !invIssueDate) return;

    createInvoiceMutation.mutate({
      invoiceNumber: invNum,
      amount: Number(invAmount),
      status: invStatus,
      issueDate: invIssueDate,
      dueDate: invDueDate,
      documentUrl: invDoc,
    }, {
      onSuccess: () => {
        setInvNum("");
        setInvAmount(0);
        setInvStatus("draft");
        setInvIssueDate("");
        setInvDueDate("");
        setInvDoc("");
        setShowIssueCalendar(false);
        setShowDueCalendar(false);
        setIsCreateInvoiceOpen(false);
      },
    });
  };

  // Update Invoice Status
  const handleUpdateInvoiceStatus = (invoiceId: string, nextStatus: InvoiceStatus) => {
    updateInvoiceMutation.mutate({
      invoiceId,
      payload: { status: nextStatus },
    });
  };

  // Delete handlers triggering
  const handleDeleteTrigger = (type: string, id: string, name: string) => {
    setDeleteContext({ type, id, name });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteContext) return;
    const { type, id } = deleteContext;

    const options = {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeleteContext(null);
      },
    };

    switch (type) {
      case "progress":
        deleteProgressMutation.mutate(id, options);
        break;
      case "document":
        deleteDocMutation.mutate(id, options);
        break;
      case "maintLog":
        deleteMaintLogMutation.mutate(id, options);
        break;
      case "maint":
        deleteMaintMutation.mutate(id, options);
        break;
      case "invoice":
        deleteInvoiceMutation.mutate(id, options);
        break;
    }
  };

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        {/* Head Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href={data?.project ? `/admin/clients/${data.project.clientId}` : "/admin/clients"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Kelola Detail Project
            </span>
            <h1 className="text-2xl font-sans font-medium tracking-tight text-foreground">
              {data?.project?.name}
            </h1>
          </div>
        </div>

        {projectQuery.isLoading ? (
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        ) : projectQuery.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat detail project.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
            {/* Tabs List Navigation (Sidebar tabs) */}
            <div className="flex flex-col border-r border-border/60 pr-4 gap-1.5 shrink-0">
              {[
                { id: "info", label: "Informasi Project", icon: Settings },
                { id: "progress", label: "Progress Timeline", icon: Clock },
                { id: "docs", label: "Dokumen Deliverables", icon: Layers },
                { id: "maintenance", label: "Paket Maintenance", icon: Wrench },
                { id: "invoice", label: "Invoice & Billing", icon: FileText },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as TabType)}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground font-extrabold shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="min-w-0">
              {/* Info Tab */}
              {activeTab === "info" && (
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <form onSubmit={handleUpdateInfo} className="space-y-4">
                    <h2 className="text-lg font-sans font-semibold tracking-tight text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
                      Edit Informasi Metadata Project
                    </h2>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-name">Nama Project</FieldLabel>
                        <Input
                          id="info-name"
                          type="text"
                          required
                          value={name ?? data?.project?.name ?? ""}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-desc">Deskripsi</FieldLabel>
                        <Textarea
                          id="info-desc"
                          required
                          value={description ?? data?.project?.description ?? ""}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-pic">Nama PIC</FieldLabel>
                        <Input
                          id="info-pic"
                          type="text"
                          required
                          value={picName ?? data?.project?.picName ?? ""}
                          onChange={(e) => setPicName(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-contact">Kontak PIC</FieldLabel>
                        <Input
                          id="info-contact"
                          type="text"
                          required
                          value={picContact ?? data?.project?.picContact ?? ""}
                          onChange={(e) => setPicContact(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-start">Tanggal Mulai</FieldLabel>
                        <Input
                          id="info-start"
                          type="date"
                          required
                          value={startDate ?? data?.project?.startDate ?? ""}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-target">Target Selesai</FieldLabel>
                        <Input
                          id="info-target"
                          type="date"
                          required
                          value={targetEndDate ?? data?.project?.targetEndDate ?? ""}
                          onChange={(e) => setTargetEndDate(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-status">Status Project</FieldLabel>
                        <Select
                          id="info-status"
                          value={status ?? data?.project?.status ?? "discovery"}
                          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                        >
                          <option value="discovery">Discovery</option>
                          <option value="planning">Planning</option>
                          <option value="development">Development</option>
                          <option value="testing">Testing</option>
                          <option value="deployment">Deployment</option>
                          <option value="completed">Completed</option>
                          <option value="maintenance">Maintenance</option>
                        </Select>
                      </Field>
                      <div className="border-t border-border/60 my-2 sm:col-span-2 pt-2" />
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-web">URL Website Utama (Production)</FieldLabel>
                        <Input
                          id="info-web"
                          type="text"
                          value={websiteUrl ?? data?.project?.websiteUrl ?? ""}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://client-domain.com"
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-staging">URL Staging / Dev Website</FieldLabel>
                        <Input
                          id="info-staging"
                          type="text"
                          value={stagingUrl ?? data?.project?.stagingUrl ?? ""}
                          onChange={(e) => setStagingUrl(e.target.value)}
                          placeholder="https://staging.gilabs.io"
                        />
                      </Field>
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-cred">Credentials (Akses Akun)</FieldLabel>
                        <Textarea
                          id="info-cred"
                          value={credentials ?? data?.project?.credentials ?? ""}
                          onChange={(e) => setCredentials(e.target.value)}
                          placeholder="Username/Password CMS, panel hosting, dll."
                        />
                      </Field>
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-doc">Dokumentasi Proyek</FieldLabel>
                        <Textarea
                          id="info-doc"
                          value={documentation ?? data?.project?.documentation ?? ""}
                          onChange={(e) => setDocumentation(e.target.value)}
                          placeholder="Link readme, wiki, link git, dll."
                        />
                      </Field>
                    </FieldGroup>
                    <div className="flex justify-end pt-4 border-t border-border/60">
                      <Button
                        type="submit"
                        disabled={updateProjectMutation.isPending}
                        className="cursor-pointer font-bold inline-flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Simpan Metadata
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === "progress" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-sans font-semibold tracking-tight text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Timeline Milestone Progres
                    </h3>
                    <button
                      onClick={() => {
                        setMilestoneTitle("");
                        setMilestoneNotes("");
                        setMilestoneDoc("");
                        setMilestonePercent(0);
                        setMilestoneStatus("pending");
                        setIsCreateProgressOpen(true);
                      }}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      Tambah Milestone
                    </button>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-4">
                    {data?.progress && data.progress.length > 0 ? (
                      <div className="space-y-3">
                        {data.progress.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-lg border border-border bg-card p-4 flex justify-between items-start gap-4 transition-all hover:shadow-sm"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-foreground">{p.title}</h4>
                                <span className="text-xs text-primary font-bold">{p.percentage}%</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">Tgl: {p.updateDate}</p>
                              {p.notes && <p className="text-xs text-muted-foreground mt-2">{p.notes}</p>}
                              {p.documentUrl && (
                                <a
                                  href={resolveAssetUrl(p.documentUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-block mt-2 text-xs text-primary hover:underline font-bold"
                                >
                                  Lampiran PDF
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                                {p.status}
                              </span>
                              <button
                                onClick={() => handleEditProgressTrigger(p)}
                                className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 py-1 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTrigger("progress", p.id, p.title)}
                                className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 py-1 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                        Belum ada progres timeline terdaftar.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "docs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-sans font-semibold tracking-tight text-foreground">Dokumen Serah Terima & Manual</h3>
                    <button
                      onClick={() => {
                        setDocTitle("");
                        setDocUrl("");
                        setIsCreateDocOpen(true);
                      }}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      Unggah Dokumen Baru
                    </button>
                  </div>

                  {/* Documents list */}
                  <div className="space-y-4">
                    {data?.documents && data.documents.length > 0 ? (
                      <div className="divide-y divide-border/60 rounded-lg border border-border bg-card px-4">
                        {data.documents.map((d) => (
                          <div key={d.id} className="flex justify-between items-center py-3">
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{d.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Upload: {formatDate(d.uploadedAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={resolveAssetUrl(d.documentUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 text-xs font-bold text-foreground hover:bg-border cursor-pointer"
                              >
                                View / Link
                              </a>
                              <button
                                onClick={() => handleDeleteTrigger("document", d.id, d.title)}
                                className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 py-1 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                        Belum ada dokumen deliverables diunggah.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Maintenance Tab */}
              {activeTab === "maintenance" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-sans font-semibold tracking-tight text-foreground">Daftar Paket Maintenance</h3>
                    <button
                      onClick={() => {
                        setEditingMaintItem(null);
                        setMaintPackage("");
                        setMaintLimit(12);
                        setMaintDuration("1");
                        setIsMaintSetupOpen(true);
                      }}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      Tambah Paket Maintenance
                    </button>
                  </div>

                  {data?.maintenance && data.maintenance.length > 0 ? (
                    <div className="space-y-4">
                      {data.maintenance.map((m) => (
                        <div key={m.id} className="rounded-lg border border-border bg-card p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                                Paket Terdaftar
                              </span>
                              <h3 className="text-lg font-sans font-semibold text-foreground mt-1">
                                {m.packageName}
                              </h3>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingMaintItem(m);
                                  setMaintPackage(m.packageName);
                                  setMaintLimit(m.quotaLimit);
                                  
                                  const diffMonths = (startStr: string, endStr: string) => {
                                    const start = new Date(startStr);
                                    const end = new Date(endStr);
                                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
                                    const diffTime = Math.abs(end.getTime() - start.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const mCount = Math.round(diffDays / 30.4375);
                                    return mCount <= 0 ? 1 : mCount;
                                  };
                                  setMaintDuration(String(diffMonths(m.startDate, m.endDate)));
                                  setIsMaintSetupOpen(true);
                                }}
                                className="inline-flex min-h-8 items-center justify-center rounded bg-secondary px-2.5 py-1 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTrigger("maint", m.id, m.packageName)}
                                className="inline-flex min-h-8 items-center justify-center rounded bg-destructive/10 text-destructive hover:bg-destructive/20 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>

                          <div className="mt-5">
                            <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                              <span>Pemakaian kuota maintenance tahunan</span>
                              <span className="font-extrabold text-foreground">
                                {m.quotaUsed} / {m.quotaLimit} Request
                              </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-border overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    (m.quotaUsed / m.quotaLimit) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
                            <span>Sisa Kuota: <strong>{m.quotaLimit - m.quotaUsed} request</strong></span>
                            <span>Periode Aktif: {m.startDate} s/d {m.endDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-card p-5 text-center text-muted-foreground">
                      Project ini belum memiliki paket maintenance yang terdaftar.
                    </div>
                  )}

                  {/* Audit Logs Usage */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-extrabold text-foreground">Histori Log Pemakaian Maintenance</h3>
                      <button
                        onClick={() => {
                          setLogDesc("");
                          setLogPic("");
                          setLogStatus("pending");
                          const firstMaint = data?.maintenance?.[0];
                          setSelectedMaintLogId(firstMaint?.id ?? "");
                          setIsCreateMaintLogOpen(true);
                        }}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        Catat Request Pengerjaan
                      </button>
                    </div>

                    {data?.maintLogs && data.maintLogs.length > 0 ? (
                      <div className="space-y-3">
                        {data.maintLogs.map((l) => (
                          <div
                            key={l.id}
                            className="rounded-lg border border-border bg-card p-4 flex justify-between items-start gap-4 transition-all hover:shadow-sm"
                          >
                            <div>
                              <h4 className="text-sm font-extrabold text-foreground">{l.description}</h4>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                <span>Tanggal: {l.requestDate}</span>
                                <span>·</span>
                                <span>PIC: {l.picName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                                {l.status}
                              </span>
                              <button
                                onClick={() => handleDeleteTrigger("maintLog", l.id, l.description)}
                                className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 py-1 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                        Belum ada histori pengerjaan maintenance tercatat.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invoice Tab */}
              {activeTab === "invoice" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-sans font-semibold tracking-tight text-foreground">Daftar Tagihan Invoice</h3>
                    <button
                      onClick={() => {
                        setInvNum("");
                        setInvAmount(0);
                        setInvStatus("draft");
                        setInvIssueDate(formatDateInput(new Date()));
                        setInvDueDate("");
                        setInvDoc("");
                        setShowIssueCalendar(false);
                        setShowDueCalendar(false);
                        setIsCreateInvoiceOpen(true);
                      }}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      Terbitkan Invoice Baru
                    </button>
                  </div>

                  {data?.invoices && data.invoices.length > 0 ? (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                      <ScrollArea orientation="horizontal">
                        <table className="w-full min-w-150 border-collapse text-left text-sm">
                          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                            <tr>
                              <th className="border-b border-border px-4 py-3">No. Invoice</th>
                              <th className="border-b border-border px-4 py-3">Nominal</th>
                              <th className="border-b border-border px-4 py-3">Status</th>
                              <th className="border-b border-border px-4 py-3">Jatuh Tempo</th>
                              <th className="border-b border-border px-4 py-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.invoices.map((inv) => (
                              <tr
                                key={inv.id}
                                className="align-middle hover:bg-secondary/40 transition-colors"
                              >
                                <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                                  {inv.invoiceNumber}
                                </td>
                                <td className="border-b border-border px-4 py-3 text-foreground font-semibold">
                                  {formatCurrency(inv.amount)}
                                </td>
                                <td className="border-b border-border px-4 py-3">
                                  <select
                                    value={inv.status}
                                    onChange={(e) => handleUpdateInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                                    className="rounded border border-border bg-background px-2 py-1 text-xs cursor-pointer focus:outline-none"
                                  >
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="waiting_payment">Waiting Payment</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                  </select>
                                </td>
                                <td className="border-b border-border px-4 py-3 text-muted-foreground">
                                  {inv.dueDate}
                                </td>
                                <td className="border-b border-border px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    {inv.documentUrl && (
                                      <a
                                        href={resolveAssetUrl(inv.documentUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 text-xs font-bold text-foreground hover:bg-border cursor-pointer"
                                      >
                                        PDF
                                      </a>
                                    )}
                                    <button
                                      onClick={() => handleDeleteTrigger("invoice", inv.id, inv.invoiceNumber)}
                                      className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 py-1 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                      Belum ada invoice diterbitkan.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialog Overlays */}

      {/* Create Progress Milestone Dialog */}
      {isCreateProgressOpen && (
        <Dialog open={isCreateProgressOpen} onOpenChange={setIsCreateProgressOpen}>
          <DialogOverlay className="bg-primary/30" />
          <DialogContent className="max-w-md">
            <DialogHeader className="border-b-0 pb-2">
              <DialogTitle>Tambah Milestone</DialogTitle>
            </DialogHeader>
            <DialogBody className="pt-0">
              <form onSubmit={handleAddMilestone} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel htmlFor="prog-title">Nama Milestone</FieldLabel>
                  <Input
                    id="prog-title"
                    type="text"
                    required
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    placeholder="Requirement Gathering"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="prog-status">Status</FieldLabel>
                  <Select
                    id="prog-status"
                    value={milestoneStatus}
                    onChange={(e) => setMilestoneStatus(e.target.value as ProgressStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="prog-percent">Persentase ({milestonePercent}%)</FieldLabel>
                  <Input
                    id="prog-percent"
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={milestonePercent}
                    onChange={(e) => setMilestonePercent(Number(e.target.value))}
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="prog-notes">Catatan</FieldLabel>
                  <Textarea
                    id="prog-notes"
                    value={milestoneNotes}
                    onChange={(e) => setMilestoneNotes(e.target.value)}
                    placeholder="Catatan pengerjaan"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel>Lampiran PDF Dokumen</FieldLabel>
                  <FileUpload
                    value={milestoneDoc}
                    onChange={setMilestoneDoc}
                    uploadContext={{
                      category: "progress",
                      clientId: data?.project?.clientId,
                      projectId,
                    }}
                  />
                </Field>
              </FieldGroup>
                <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsCreateProgressOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" isLoading={createProgressMutation.isPending}>
                    Tambah
                  </Button>
                </DialogFooter>
              </form>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Progress Milestone Dialog */}
      {isEditProgressOpen && (
        <Dialog open={isEditProgressOpen} onOpenChange={setIsEditProgressOpen}>
          <DialogOverlay className="bg-primary/30" />
          <DialogContent className="max-w-md">
            <DialogHeader className="border-b-0 pb-2">
              <DialogTitle>Edit Milestone</DialogTitle>
            </DialogHeader>
            <DialogBody className="pt-0">
              <form onSubmit={handleUpdateMilestone} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel htmlFor="edit-prog-title">Nama Milestone</FieldLabel>
                  <Input
                    id="edit-prog-title"
                    type="text"
                    required
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="edit-prog-status">Status</FieldLabel>
                  <Select
                    id="edit-prog-status"
                    value={milestoneStatus}
                    onChange={(e) => setMilestoneStatus(e.target.value as ProgressStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="edit-prog-percent">Persentase ({milestonePercent}%)</FieldLabel>
                  <Input
                    id="edit-prog-percent"
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={milestonePercent}
                    onChange={(e) => setMilestonePercent(Number(e.target.value))}
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="edit-prog-notes">Catatan</FieldLabel>
                  <Textarea
                    id="edit-prog-notes"
                    value={milestoneNotes}
                    onChange={(e) => setMilestoneNotes(e.target.value)}
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel>Lampiran PDF Dokumen</FieldLabel>
                  <FileUpload
                    value={milestoneDoc}
                    onChange={setMilestoneDoc}
                    uploadContext={{
                      category: "progress",
                      clientId: data?.project?.clientId,
                      projectId,
                    }}
                  />
                </Field>
              </FieldGroup>
                <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsEditProgressOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" isLoading={updateProgressMutation.isPending}>
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Document Dialog */}
      {isCreateDocOpen && (
        <Dialog open={isCreateDocOpen} onOpenChange={setIsCreateDocOpen}>
          <DialogOverlay className="bg-primary/30" />
          <DialogContent className="max-w-md">
            <DialogHeader className="border-b-0 pb-2">
              <DialogTitle>Upload Dokumen</DialogTitle>
            </DialogHeader>
            <DialogBody className="pt-0">
              <form onSubmit={handleAddDocument} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel htmlFor="doc-title">Nama Dokumen</FieldLabel>
                  <Input
                    id="doc-title"
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="User Manual App v1.0"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel>File Dokumen PDF</FieldLabel>
                  <FileUpload
                    value={docUrl}
                    onChange={setDocUrl}
                    uploadContext={{
                      category: "documents",
                      clientId: data?.project?.clientId,
                      projectId,
                    }}
                  />
                </Field>
              </FieldGroup>
                <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsCreateDocOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" isLoading={createDocMutation.isPending}>
                    Unggah
                  </Button>
                </DialogFooter>
              </form>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Configure Maintenance Dialog */}
      {isMaintSetupOpen && (
        <Dialog open={isMaintSetupOpen} onOpenChange={setIsMaintSetupOpen}>
          <DialogOverlay className="bg-primary/30" />
          <DialogContent className="max-w-md">
            <DialogHeader className="border-b-0 pb-2">
              <DialogTitle>Konfigurasi Maintenance</DialogTitle>
            </DialogHeader>
            <DialogBody className="pt-0">
              <form onSubmit={handleSaveMaintenance} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel htmlFor="maint-pack">Jenis Paket Maintenance</FieldLabel>
                  <Input
                    id="maint-pack"
                    type="text"
                    required
                    value={maintPackage}
                    onChange={(e) => setMaintPackage(e.target.value)}
                    placeholder="Paket Standard 10 Request/Bulan"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="maint-duration">Durasi Layanan</FieldLabel>
                  <Select
                    id="maint-duration"
                    value={maintDuration}
                    onChange={(e) => setMaintDuration(e.target.value)}
                  >
                    <option value="1">1 Bulan</option>
                    <option value="3">3 Bulan</option>
                    <option value="6">6 Bulan</option>
                    <option value="12">12 Bulan (1 Tahun)</option>
                  </Select>
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="maint-limit">Batas Kuota Request (Per Bulan)</FieldLabel>
                  <Input
                    id="maint-limit"
                    type="number"
                    required
                    value={maintLimit}
                    onChange={(e) => setMaintLimit(Number(e.target.value))}
                  />
                </Field>
              </FieldGroup>
                <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsMaintSetupOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" isLoading={createMaintMutation.isPending || updateMaintMutation.isPending}>
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Log Maintenance Request Dialog */}
      {isCreateMaintLogOpen && (
        <Dialog open={isCreateMaintLogOpen} onOpenChange={setIsCreateMaintLogOpen}>
          <DialogOverlay className="bg-primary/30" />
          <DialogContent className="max-w-md">
            <DialogHeader className="border-b-0 pb-2">
              <DialogTitle>Catat Request Maintenance</DialogTitle>
            </DialogHeader>
            <DialogBody className="pt-0">
              <form onSubmit={handleAddMaintLog} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel htmlFor="log-maint-select">Pilih Paket Maintenance</FieldLabel>
                  <Select
                    id="log-maint-select"
                    required
                    value={selectedMaintLogId}
                    onChange={(e) => setSelectedMaintLogId(e.target.value)}
                  >
                    <option value="">-- Pilih Paket --</option>
                    {data?.maintenance?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.packageName} (Sisa: {m.quotaLimit - m.quotaUsed} request)
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="log-desc">Deskripsi Kerja</FieldLabel>
                  <Textarea
                    id="log-desc"
                    required
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    placeholder="Perbaikan bug crash tombol payment"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="log-status">Status Pengerjaan</FieldLabel>
                  <Select
                    id="log-status"
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value as ProgressStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="log-pic">PIC Internal Handler</FieldLabel>
                  <Input
                    id="log-pic"
                    type="text"
                    required
                    value={logPic}
                    onChange={(e) => setLogPic(e.target.value)}
                    placeholder="Fikri GiLabs"
                  />
                </Field>
              </FieldGroup>
                <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsCreateMaintLogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" isLoading={createMaintLogMutation.isPending}>
                    Catat
                  </Button>
                </DialogFooter>
              </form>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Invoice Dialog */}
      {isCreateInvoiceOpen && (
        <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
          <DialogOverlay className="bg-primary/30" />
          <DialogContent className="max-w-md">
            <DialogHeader className="border-b-0 pb-2">
              <DialogTitle>Terbitkan Invoice</DialogTitle>
            </DialogHeader>
            <DialogBody className="pt-0">
              <form onSubmit={handleAddInvoice} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel htmlFor="inv-num">No. Invoice</FieldLabel>
                  <Input
                    id="inv-num"
                    type="text"
                    required
                    value={invNum}
                    onChange={(e) => setInvNum(e.target.value)}
                    placeholder="INV/GILABS/2026/012"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="inv-amount">Nominal (Rp)</FieldLabel>
                  <NumericInput
                    id="inv-amount"
                    required
                    value={invAmount}
                    min={0}
                    onChange={setInvAmount}
                    placeholder="15000000"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="inv-status">Status</FieldLabel>
                  <Select
                    id="inv-status"
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as InvoiceStatus)}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="waiting_payment">Waiting Payment</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </Select>
                </Field>
                <Field className="space-y-1">
                  <div className="relative" ref={issueCalendarRef}>
                  <FieldLabel htmlFor="inv-issue">Tanggal Terbit</FieldLabel>
                  <button
                    id="inv-issue"
                    type="button"
                    onClick={() => {
                      setShowIssueCalendar((current) => !current);
                      setShowDueCalendar(false);
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-lg border border-input bg-card px-3 py-2 text-left text-sm text-foreground transition-all duration-300 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <span>{formatDateLabel(invIssueDate)}</span>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {showIssueCalendar && (
                    <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-border bg-card p-2 shadow-2xl">
                      <Calendar
                        className="border-0 p-3 shadow-none"
                        value={parseDateInput(invIssueDate) ?? new Date()}
                        onChange={(date) => {
                          setInvIssueDate(formatDateInput(date));
                          setShowIssueCalendar(false);
                        }}
                      />
                    </div>
                  )}
                  </div>
                </Field>
                <Field className="space-y-1">
                  <div className="relative" ref={dueCalendarRef}>
                  <FieldLabel htmlFor="inv-due">Tanggal Jatuh Tempo</FieldLabel>
                  <button
                    id="inv-due"
                    type="button"
                    onClick={() => {
                      setShowDueCalendar((current) => !current);
                      setShowIssueCalendar(false);
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-lg border border-input bg-card px-3 py-2 text-left text-sm text-foreground transition-all duration-300 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <span>{invDueDate ? formatDateLabel(invDueDate) : "Opsional"}</span>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {showDueCalendar && (
                    <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[21rem] rounded-2xl border border-border bg-card p-2 shadow-2xl">
                      <div className="space-y-2">
                        <Calendar
                          className="border-0 p-3 shadow-none"
                          value={parseDateInput(invDueDate) ?? parseDateInput(invIssueDate) ?? new Date()}
                          onChange={(date) => {
                            setInvDueDate(formatDateInput(date));
                            setShowDueCalendar(false);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            setInvDueDate("");
                            setShowDueCalendar(false);
                          }}
                        >
                          Kosongkan tanggal jatuh tempo
                        </Button>
                      </div>
                    </div>
                  )}
                  </div>
                </Field>
                <Field className="space-y-1">
                  <FieldLabel>Dokumen PDF Invoice</FieldLabel>
                  <FileUpload
                    value={invDoc}
                    onChange={setInvDoc}
                    uploadContext={{
                      category: "invoice",
                      clientId: data?.project?.clientId,
                      projectId,
                    }}
                  />
                </Field>
              </FieldGroup>
                <DialogFooter className="border-t-0 px-0 pb-0 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsCreateInvoiceOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" isLoading={createInvoiceMutation.isPending}>
                    Terbitkan
                  </Button>
                </DialogFooter>
              </form>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Unified delete confirmation dialog overlay */}
      <DeleteDialog
        open={deleteOpen}
        itemName={deleteContext?.name ?? ""}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
      />
    </AppShell>
  );
}
