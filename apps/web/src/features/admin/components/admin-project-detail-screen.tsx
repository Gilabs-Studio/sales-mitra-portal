"use client";

import * as React from "react";
import {
  ArrowLeft,
  Settings,
  Clock,
  Layers,
  Wrench,
  FileText,
  Plus,
  Trash2,
  Calendar,
  Save,
  CheckCircle,
  ShieldAlert,
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
  useCreateOrUpdateMaintenance,
  useCreateMaintenanceLog,
  useDeleteMaintenanceLog,
  useCreateProjectInvoice,
  useUpdateProjectInvoice,
  useDeleteProjectInvoice,
} from "../hooks/use-admin-projects";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDate } from "@/lib/utils";

type TabType = "info" | "progress" | "docs" | "maintenance" | "invoice";

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
  const saveMaintMutation = useCreateOrUpdateMaintenance(projectId);
  const createMaintLogMutation = useCreateMaintenanceLog(projectId);
  const deleteMaintLogMutation = useDeleteMaintenanceLog(projectId);
  const createInvoiceMutation = useCreateProjectInvoice(projectId);
  const updateInvoiceMutation = useUpdateProjectInvoice(projectId);
  const deleteInvoiceMutation = useDeleteProjectInvoice(projectId);

  // Modal / Delete dialog states
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteContext, setDeleteContext] = React.useState<{ type: string; id: string; name: string } | null>(null);

  // Edit Project Info form states
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [picName, setPicName] = React.useState("");
  const [picContact, setPicContact] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [targetEndDate, setTargetEndDate] = React.useState("");
  const [status, setStatus] = React.useState("discovery");
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [stagingUrl, setStagingUrl] = React.useState("");
  const [credentials, setCredentials] = React.useState("");
  const [documentation, setDocumentation] = React.useState("");

  // Milestone Form
  const [milestoneTitle, setMilestoneTitle] = React.useState("");
  const [milestoneStatus, setMilestoneStatus] = React.useState("pending");
  const [milestonePercent, setMilestonePercent] = React.useState(0);
  const [milestoneNotes, setMilestoneNotes] = React.useState("");
  const [milestoneDoc, setMilestoneDoc] = React.useState("");

  // Document Form
  const [docTitle, setDocTitle] = React.useState("");
  const [docUrl, setDocUrl] = React.useState("");

  // Maintenance Package Form
  const [maintPackage, setMaintPackage] = React.useState("");
  const [maintStart, setMaintStart] = React.useState("");
  const [maintEnd, setMaintEnd] = React.useState("");
  const [maintLimit, setMaintLimit] = React.useState(12);

  // Maintenance usage log form
  const [logDesc, setLogDesc] = React.useState("");
  const [logStatus, setLogStatus] = React.useState("pending");
  const [logPic, setLogPic] = React.useState("");

  // Invoice Form
  const [invNum, setInvNum] = React.useState("");
  const [invAmount, setInvAmount] = React.useState(0);
  const [invStatus, setInvStatus] = React.useState("draft");
  const [invIssueDate, setInvIssueDate] = React.useState("");
  const [invDueDate, setInvDueDate] = React.useState("");
  const [invDoc, setInvDoc] = React.useState("");

  const data = projectQuery.data;

  // Initialize fields once data loaded
  React.useEffect(() => {
    if (data?.project) {
      const p = data.project;
      setName(p.name);
      setDescription(p.description);
      setPicName(p.picName);
      setPicContact(p.picContact);
      setStartDate(p.startDate);
      setTargetEndDate(p.targetEndDate);
      setStatus(p.status);
      setWebsiteUrl(p.websiteUrl ?? "");
      setStagingUrl(p.stagingUrl ?? "");
      setCredentials(p.credentials ?? "");
      setDocumentation(p.documentation ?? "");
    }
    if (data?.maintenance) {
      const m = data.maintenance;
      setMaintPackage(m.packageName);
      setMaintStart(m.startDate);
      setMaintEnd(m.endDate);
      setMaintLimit(m.quotaLimit);
    }
  }, [data]);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  // Submit metadata updates
  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate({
      name,
      description,
      picName,
      picContact,
      startDate,
      targetEndDate,
      status,
      websiteUrl,
      stagingUrl,
      credentials,
      documentation,
    }, {
      onSuccess: () => alert("Informasi project berhasil diperbarui."),
    });
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
      },
    });
  };

  // Save/setup maintenance
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintPackage.trim() || !maintStart || !maintEnd) return;

    saveMaintMutation.mutate({
      packageName: maintPackage,
      startDate: maintStart,
      endDate: maintEnd,
      quotaLimit: Number(maintLimit),
      quotaUsed: data?.maintenance?.quotaUsed ?? 0,
    }, {
      onSuccess: () => alert("Paket maintenance berhasil dikonfigurasi."),
    });
  };

  // Add maintenance request usage log
  const handleAddMaintLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDesc.trim() || !logPic.trim()) return;

    createMaintLogMutation.mutate({
      description: logDesc,
      status: logStatus,
      picName: logPic,
      requestDate: new Date().toISOString().split("T")[0],
    }, {
      onSuccess: () => {
        setLogDesc("");
        setLogPic("");
        setLogStatus("pending");
      },
    });
  };

  // Add Invoice
  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invNum.trim() || invAmount <= 0 || !invIssueDate || !invDueDate) return;

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
      },
    });
  };

  // Update Invoice Status
  const handleUpdateInvoiceStatus = (invoiceId: string, nextStatus: string) => {
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
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
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
                    <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
                      Edit Informasi Metadata Project
                    </h2>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-name">Nama Project</FieldLabel>
                        <Input
                          id="info-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-desc">Deskripsi</FieldLabel>
                        <Textarea
                          id="info-desc"
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-pic">Nama PIC</FieldLabel>
                        <Input
                          id="info-pic"
                          type="text"
                          required
                          value={picName}
                          onChange={(e) => setPicName(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-contact">Kontak PIC</FieldLabel>
                        <Input
                          id="info-contact"
                          type="text"
                          required
                          value={picContact}
                          onChange={(e) => setPicContact(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-start">Tanggal Mulai</FieldLabel>
                        <Input
                          id="info-start"
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-target">Target Selesai</FieldLabel>
                        <Input
                          id="info-target"
                          type="date"
                          required
                          value={targetEndDate}
                          onChange={(e) => setTargetEndDate(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-status">Status Project</FieldLabel>
                        <Select
                          id="info-status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
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
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://client-domain.com"
                        />
                      </Field>
                      <Field className="space-y-1.5">
                        <FieldLabel htmlFor="info-staging">URL Staging / Dev Website</FieldLabel>
                        <Input
                          id="info-staging"
                          type="text"
                          value={stagingUrl}
                          onChange={(e) => setStagingUrl(e.target.value)}
                          placeholder="https://staging.gilabs.io"
                        />
                      </Field>
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-cred">Credentials (Akses Akun)</FieldLabel>
                        <Textarea
                          id="info-cred"
                          value={credentials}
                          onChange={(e) => setCredentials(e.target.value)}
                          placeholder="Username/Password CMS, panel hosting, dll."
                        />
                      </Field>
                      <Field className="space-y-1.5 sm:col-span-2">
                        <FieldLabel htmlFor="info-doc">Dokumentasi Proyek</FieldLabel>
                        <Textarea
                          id="info-doc"
                          value={documentation}
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
                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                  {/* Create progress form */}
                  <div className="rounded-lg border border-border bg-card p-5 h-fit">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Tambah Milestone Timeline
                    </h3>
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
                            onChange={(e) => setMilestoneStatus(e.target.value)}
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
                          <FieldLabel htmlFor="prog-notes">Catatan Perkembangan</FieldLabel>
                          <Textarea
                            id="prog-notes"
                            value={milestoneNotes}
                            onChange={(e) => setMilestoneNotes(e.target.value)}
                            placeholder="Catatan update progress"
                          />
                        </Field>
                        <Field className="space-y-1">
                          <FieldLabel htmlFor="prog-doc">Lampiran Dokumen PDF (URL)</FieldLabel>
                          <Input
                            id="prog-doc"
                            type="text"
                            value={milestoneDoc}
                            onChange={(e) => setMilestoneDoc(e.target.value)}
                            placeholder="https://s3.bucket/path.pdf"
                          />
                        </Field>
                      </FieldGroup>
                      <Button
                        type="submit"
                        disabled={createProgressMutation.isPending}
                        className="w-full justify-center cursor-pointer font-bold"
                      >
                        Tambah Progress
                      </Button>
                    </form>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-4">
                    <h3 className="text-md font-extrabold text-foreground">Timeline Progres Saat Ini</h3>
                    {data?.progress && data.progress.length > 0 ? (
                      <div className="space-y-3">
                        {data.progress.map((p: any) => (
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
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                                {p.status}
                              </span>
                              <button
                                onClick={() => handleDeleteTrigger("progress", p.id, p.title)}
                                className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                              >
                                <Trash2 className="h-4 w-4" />
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
                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                  {/* Create document form */}
                  <div className="rounded-lg border border-border bg-card p-5 h-fit">
                    <h3 className="text-md font-extrabold text-foreground mb-4">Upload Dokumen Deliverable</h3>
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
                          <FieldLabel htmlFor="doc-url">Dokumen URL (S3/PDF Link)</FieldLabel>
                          <Input
                            id="doc-url"
                            type="text"
                            required
                            value={docUrl}
                            onChange={(e) => setDocUrl(e.target.value)}
                            placeholder="https://s3.bucket/manual.pdf"
                          />
                        </Field>
                      </FieldGroup>
                      <Button
                        type="submit"
                        disabled={createDocMutation.isPending}
                        className="w-full justify-center cursor-pointer font-bold"
                      >
                        Unggah Dokumen
                      </Button>
                    </form>
                  </div>

                  {/* Documents list */}
                  <div className="space-y-4">
                    <h3 className="text-md font-extrabold text-foreground">Dokumen Proyek Terupload</h3>
                    {data?.documents && data.documents.length > 0 ? (
                      <div className="divide-y divide-border/60 rounded-lg border border-border bg-card px-4">
                        {data.documents.map((d: any) => (
                          <div key={d.id} className="flex justify-between items-center py-3">
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{d.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Upload: {formatDate(d.uploadedAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={d.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 text-xs font-bold text-foreground hover:bg-border cursor-pointer"
                              >
                                View / Link
                              </a>
                              <button
                                onClick={() => handleDeleteTrigger("document", d.id, d.title)}
                                className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                              >
                                <Trash2 className="h-4 w-4" />
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
                  {/* Quota setup form */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground pb-2 border-b border-border/60 mb-4">
                      Konfigurasi Kuota Maintenance Proyek
                    </h3>
                    <form onSubmit={handleSaveMaintenance} className="grid gap-4 sm:grid-cols-2">
                      <Field className="space-y-1 sm:col-span-2">
                        <FieldLabel htmlFor="maint-pack">Jenis Paket Maintenance</FieldLabel>
                        <Input
                          id="maint-pack"
                          type="text"
                          required
                          value={maintPackage}
                          onChange={(e) => setMaintPackage(e.target.value)}
                          placeholder="Paket Standard 12 Request/Tahun"
                        />
                      </Field>
                      <Field className="space-y-1">
                        <FieldLabel htmlFor="maint-start">Tanggal Mulai Aktif</FieldLabel>
                        <Input
                          id="maint-start"
                          type="date"
                          required
                          value={maintStart}
                          onChange={(e) => setMaintStart(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1">
                        <FieldLabel htmlFor="maint-end">Tanggal Akhir Aktif</FieldLabel>
                        <Input
                          id="maint-end"
                          type="date"
                          required
                          value={maintEnd}
                          onChange={(e) => setMaintEnd(e.target.value)}
                        />
                      </Field>
                      <Field className="space-y-1">
                        <FieldLabel htmlFor="maint-limit">Batas Kuota Layanan (Jumlah Request)</FieldLabel>
                        <Input
                          id="maint-limit"
                          type="number"
                          required
                          value={maintLimit}
                          onChange={(e) => setMaintLimit(Number(e.target.value))}
                        />
                      </Field>
                      <div className="sm:col-span-2 flex justify-end">
                        <Button
                          type="submit"
                          disabled={saveMaintMutation.isPending}
                          className="cursor-pointer font-bold inline-flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Simpan Paket
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Audit usage & Log usage creation */}
                  <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                    <div className="rounded-lg border border-border bg-card p-5 h-fit">
                      <h3 className="text-md font-extrabold text-foreground mb-4">Catat Request Maintenance</h3>
                      <form onSubmit={handleAddMaintLog} className="space-y-4">
                        <FieldGroup className="space-y-3">
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
                              onChange={(e) => setLogStatus(e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </Select>
                          </Field>
                          <Field className="space-y-1">
                            <FieldLabel htmlFor="log-pic">PIC Handler Internal</FieldLabel>
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
                        <Button
                          type="submit"
                          disabled={createMaintLogMutation.isPending}
                          className="w-full justify-center cursor-pointer font-bold"
                        >
                          Catat Request
                        </Button>
                      </form>
                    </div>

                    {/* Audit Logs Trail */}
                    <div className="space-y-4">
                      <h3 className="text-md font-extrabold text-foreground">Histori Log Pemakaian Maintenance</h3>
                      {data?.maintLogs && data.maintLogs.length > 0 ? (
                        <div className="space-y-3">
                          {data.maintLogs.map((l: any) => (
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
                                  className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
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
                </div>
              )}

              {/* Invoice Tab */}
              {activeTab === "invoice" && (
                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                  {/* Create Invoice Form */}
                  <div className="rounded-lg border border-border bg-card p-5 h-fit">
                    <h3 className="text-md font-extrabold text-foreground mb-4">Terbitkan Invoice Baru</h3>
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
                          <FieldLabel htmlFor="inv-amount">Nominal Jumlah (Rp)</FieldLabel>
                          <Input
                            id="inv-amount"
                            type="number"
                            required
                            value={invAmount}
                            onChange={(e) => setInvAmount(Number(e.target.value))}
                          />
                        </Field>
                        <Field className="space-y-1">
                          <FieldLabel htmlFor="inv-status">Status</FieldLabel>
                          <Select
                            id="inv-status"
                            value={invStatus}
                            onChange={(e) => setInvStatus(e.target.value)}
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="waiting_payment">Waiting Payment</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                          </Select>
                        </Field>
                        <Field className="space-y-1">
                          <FieldLabel htmlFor="inv-issue">Tanggal Terbit</FieldLabel>
                          <Input
                            id="inv-issue"
                            type="date"
                            required
                            value={invIssueDate}
                            onChange={(e) => setInvIssueDate(e.target.value)}
                          />
                        </Field>
                        <Field className="space-y-1">
                          <FieldLabel htmlFor="inv-due">Tanggal Jatuh Tempo</FieldLabel>
                          <Input
                            id="inv-due"
                            type="date"
                            required
                            value={invDueDate}
                            onChange={(e) => setInvDueDate(e.target.value)}
                          />
                        </Field>
                        <Field className="space-y-1">
                          <FieldLabel htmlFor="inv-doc">PDF Invoice Document (URL)</FieldLabel>
                          <Input
                            id="inv-doc"
                            type="text"
                            value={invDoc}
                            onChange={(e) => setInvDoc(e.target.value)}
                            placeholder="https://s3.bucket/inv.pdf"
                          />
                        </Field>
                      </FieldGroup>
                      <Button
                        type="submit"
                        disabled={createInvoiceMutation.isPending}
                        className="w-full justify-center cursor-pointer font-bold"
                      >
                        Terbitkan Invoice
                      </Button>
                    </form>
                  </div>

                  {/* Invoices List */}
                  <div className="space-y-4">
                    <h3 className="text-md font-extrabold text-foreground">Daftar Tagihan Invoice</h3>
                    {data?.invoices && data.invoices.length > 0 ? (
                      <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <ScrollArea orientation="horizontal">
                          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
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
                              {data.invoices.map((inv: any) => (
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
                                      onChange={(e) => handleUpdateInvoiceStatus(inv.id, e.target.value)}
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
                                          href={inv.documentUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex min-h-7 items-center justify-center rounded bg-secondary px-2 text-xs font-bold text-foreground hover:bg-border cursor-pointer"
                                        >
                                          PDF
                                        </a>
                                      )}
                                      <button
                                        onClick={() => handleDeleteTrigger("invoice", inv.id, inv.invoiceNumber)}
                                        className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                                      >
                                        <Trash2 className="h-4 w-4" />
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
