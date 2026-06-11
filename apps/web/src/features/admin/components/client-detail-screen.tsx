"use client";

import * as React from "react";
import { ArrowLeft, Plus, FolderKanban, Trash2, ArrowRight } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useClientDetail, useCreateProject, useDeleteProject } from "../hooks/use-admin-projects";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function ClientDetailScreen({ clientId }: { readonly clientId: string }) {
  const auth = useAuthGuard("admin");
  const router = useRouter();

  const clientQuery = useClientDetail(clientId);
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<{ id: string; name: string } | null>(null);

  // Form states
  const [pName, setPName] = React.useState("");
  const [pDescription, setPDescription] = React.useState("");
  const [pPicName, setPPicName] = React.useState("");
  const [pPicContact, setPPicContact] = React.useState("");
  const [pStartDate, setPStartDate] = React.useState("");
  const [pTargetEndDate, setPTargetEndDate] = React.useState("");
  const [pStatus, setPStatus] = React.useState("discovery");
  const [formError, setFormError] = React.useState("");

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleOpenCreate = () => {
    setPName("");
    setPDescription("");
    setPPicName("");
    setPPicContact("");
    setPStartDate("");
    setPTargetEndDate("");
    setPStatus("discovery");
    setFormError("");
    setCreateOpen(true);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!pName.trim() || !pDescription.trim() || !pPicName.trim() || !pPicContact.trim() || !pStartDate || !pTargetEndDate) {
      setFormError("Semua field wajib diisi.");
      return;
    }

    createProjectMutation.mutate(
      {
        clientId,
        name: pName,
        description: pDescription,
        picName: pPicName,
        picContact: pPicContact,
        startDate: pStartDate,
        targetEndDate: pTargetEndDate,
        status: pStatus,
        websiteUrl: "",
        stagingUrl: "",
        credentials: "",
        documentation: "",
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
        },
        onError: (err: any) => {
          setFormError(err.message ?? "Gagal membuat project.");
        },
      }
    );
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setSelectedProject({ id, name });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedProject) return;
    deleteProjectMutation.mutate(selectedProject.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedProject(null);
      },
    });
  };

  const client = clientQuery.data?.client;
  const projects = clientQuery.data?.projects ?? [];

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        {/* Navigation Head */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clients"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Detail Klien Portal
            </span>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {client?.name}
            </h1>
          </div>
        </div>

        {clientQuery.isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : clientQuery.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat detail klien.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  Daftar Project Terdaftar
                </h2>
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
                  Belum ada project terdaftar untuk klien ini. Klik tombol di kanan atas untuk membuat project pertama.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((p: any) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                            {p.status}
                          </span>
                          <button
                            onClick={() => handleDeleteTrigger(p.id, p.name)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Hapus Project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h3 className="mt-2 text-sm font-extrabold text-foreground line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                        <span>PIC: {p.picName}</span>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="font-bold text-primary flex items-center gap-1 cursor-pointer hover:underline"
                        >
                          Kelola
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Info Summary */}
            <aside className="rounded-lg border border-border bg-card p-5 h-fit space-y-4">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider text-muted-foreground">
                Informasi Kontak Klien
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Nama Perusahaan / Akun</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{client?.name}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Email Portal</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{client?.email}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Tanggal Registrasi</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(client?.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 px-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-extrabold text-foreground">Tambah Project Klien Baru</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Daftarkan project baru untuk klien ini dan buat dashboard pantau klien.
            </p>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20">
                  {formError}
                </div>
              )}

              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field className="space-y-1.5 sm:col-span-2">
                  <FieldLabel htmlFor="project-name">Nama Project</FieldLabel>
                  <Input
                    id="project-name"
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Contoh: Redesign Website PT Angkasa"
                  />
                </Field>

                <Field className="space-y-1.5 sm:col-span-2">
                  <FieldLabel htmlFor="project-desc">Deskripsi Project</FieldLabel>
                  <Textarea
                    id="project-desc"
                    required
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Tuliskan cakupan kerja dan ringkasan project"
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="project-pic">Nama PIC Project</FieldLabel>
                  <Input
                    id="project-pic"
                    type="text"
                    required
                    value={pPicName}
                    onChange={(e) => setPPicName(e.target.value)}
                    placeholder="Nama penanggung jawab"
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="project-contact">Kontak PIC</FieldLabel>
                  <Input
                    id="project-contact"
                    type="text"
                    required
                    value={pPicContact}
                    onChange={(e) => setPPicContact(e.target.value)}
                    placeholder="Email / No HP"
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="project-start">Tanggal Mulai</FieldLabel>
                  <Input
                    id="project-start"
                    type="date"
                    required
                    value={pStartDate}
                    onChange={(e) => setPStartDate(e.target.value)}
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="project-target">Target Selesai</FieldLabel>
                  <Input
                    id="project-target"
                    type="date"
                    required
                    value={pTargetEndDate}
                    onChange={(e) => setPTargetEndDate(e.target.value)}
                  />
                </Field>

                <Field className="space-y-1.5 sm:col-span-2">
                  <FieldLabel htmlFor="project-status">Status Project</FieldLabel>
                  <Select
                    id="project-status"
                    value={pStatus}
                    onChange={(e) => setPStatus(e.target.value)}
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
              </FieldGroup>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCreateOpen(false)}
                  disabled={createProjectMutation.isPending}
                  className="cursor-pointer font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  isLoading={createProjectMutation.isPending}
                  className="cursor-pointer font-bold"
                >
                  Buat Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project dialog */}
      <DeleteDialog
        open={deleteOpen}
        itemName={selectedProject?.name ?? ""}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
      />
    </AppShell>
  );
}
