"use client";

import * as React from "react";
import { Plus, Key, ShieldAlert, Eye, Ban } from "lucide-react";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useAdminClients, useCreateClient, useResetClientPassword, useUpdateUserSuspension } from "../hooks/use-admin-projects";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";

export function ClientManagementScreen() {
  const auth = useAuthGuard("admin");
  const [page, setPage] = React.useState(1);
  const clientsQuery = useAdminClients({ page, pageSize: 15 });
  const createClientMutation = useCreateClient();
  const updateSuspensionMutation = useUpdateUserSuspension();
  const resetPasswordMutation = useResetClientPassword();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [toggleOpen, setToggleOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<{ id: string; name: string; isSuspended: boolean } | null>(null);

  // Form states
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleOpenCreate = () => {
    setNewName("");
    setNewEmail("");
    // Generate a default strong random password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setFormError("");
    setCreateOpen(true);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setFormError("Semua field wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setFormError("Password minimal harus 8 karakter.");
      return;
    }

    createClientMutation.mutate(
      { name: newName, email: newEmail, password: newPassword },
      {
        onSuccess: () => {
          setSuccessMsg("Klien berhasil didaftarkan. Kredensial login telah dikirim ke email mereka.");
          // Reset form
          setNewName("");
          setNewEmail("");
          // Close after a short delay
          setTimeout(() => {
            setCreateOpen(false);
            setSuccessMsg("");
          }, 2000);
        },
        onError: (err: any) => {
          setFormError(err.message ?? "Gagal mendaftarkan klien.");
        },
      }
    );
  };

  const handleToggleStatusTrigger = (id: string, name: string, isSuspended: boolean) => {
    setSelectedClient({ id, name, isSuspended });
    setToggleOpen(true);
  };

  const handleConfirmToggleStatus = () => {
    if (!selectedClient) return;
    updateSuspensionMutation.mutate(
      {
        userId: selectedClient.id,
        isSuspended: !selectedClient.isSuspended,
        reason: "Administrative Action",
      },
      {
        onSuccess: () => {
          setToggleOpen(false);
          setSelectedClient(null);
        },
      }
    );
  };

  const handleTriggerReset = (id: string) => {
    resetPasswordMutation.mutate(id, {
      onSuccess: () => {
        alert("Email instruksi reset password berhasil dikirim ke klien.");
      },
    });
  };

  const clients = clientsQuery.data?.data ?? [];
  const totalPages = clientsQuery.data?.totalPages ?? 1;

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Manajemen Klien Portal
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola akun klien, hubungkan dengan project IT, dan kirim kredensial akses login.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/30 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Klien Baru
          </button>
        </div>

        {clientsQuery.isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : clientsQuery.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat data klien.
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
            Belum ada klien terdaftar. Klik tombol di kanan atas untuk membuat akun klien pertama.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <ScrollArea orientation="horizontal">
                <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                  <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="border-b border-border px-4 py-3">Nama Klien</th>
                      <th className="border-b border-border px-4 py-3">Email</th>
                      <th className="border-b border-border px-4 py-3 w-[180px]">Status</th>
                      <th className="border-b border-border px-4 py-3 w-[180px]">Terdaftar</th>
                      <th className="border-b border-border px-4 py-3 w-[260px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c: any) => (
                      <tr key={c.id} className="align-middle hover:bg-secondary/40 transition-colors">
                        <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                          {c.name}
                        </td>
                        <td className="border-b border-border px-4 py-3 text-muted-foreground">
                          {c.email}
                        </td>
                        <td className="border-b border-border px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              c.isSuspended
                                ? "bg-destructive/10 text-destructive"
                                : "bg-teal-500/10 text-teal-600"
                            }`}
                          >
                            {c.isSuspended ? "Suspended" : "Aktif"}
                          </span>
                        </td>
                        <td className="border-b border-border px-4 py-3 text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="border-b border-border px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Link
                              href={`/admin/clients/${c.id}`}
                              title="Detail & Project"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleTriggerReset(c.id)}
                              title="Reset Sandi"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatusTrigger(c.id, c.name, c.isSuspended)}
                              title={c.isSuspended ? "Aktifkan Akun" : "Tangguhkan Akun"}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                            >
                              {c.isSuspended ? (
                                <ShieldAlert className="h-4 w-4 text-destructive" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="cursor-pointer"
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="cursor-pointer"
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Client Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 px-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-extrabold text-foreground">Daftarkan Klien Baru</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Buat akun portal klien. Email onboarding beserta kredensial akan otomatis dikirimkan ke email tertera.
            </p>

            <form onSubmit={handleCreateClient} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}
              {successMsg && (
                <div className="rounded bg-teal-500/10 p-3 text-xs font-semibold text-teal-600 border border-teal-500/20">
                  {successMsg}
                </div>
              )}

              <FieldGroup className="space-y-4">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="modal-name">Nama Klien / Perusahaan</FieldLabel>
                  <Input
                    id="modal-name"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: PT Angkasa Raya / Budi Luhur"
                  />
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="modal-email">Alamat Email</FieldLabel>
                  <Input
                    id="modal-email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="budi@perusahaan.com"
                  />
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="modal-password">Password Awal (Generated)</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="modal-password"
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password min 8 karakter"
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleOpenCreate}
                      className="shrink-0 text-xs cursor-pointer font-bold"
                    >
                      Regen
                    </Button>
                  </div>
                </Field>
              </FieldGroup>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCreateOpen(false)}
                  disabled={createClientMutation.isPending}
                  className="cursor-pointer font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  isLoading={createClientMutation.isPending}
                  className="cursor-pointer font-bold"
                >
                  Simpan & Kirim
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Client Status Dialog Confirmation */}
      {toggleOpen && selectedClient && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 px-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-xl">
            <h2 className="text-lg font-extrabold text-foreground">
              {selectedClient.isSuspended ? "Aktifkan Akun?" : "Tangguhkan Akun?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Apakah Anda yakin ingin {selectedClient.isSuspended ? "mengaktifkan kembali" : "menangguhkan"} akun klien <strong>{selectedClient.name}</strong>?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setToggleOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmToggleStatus}
                isLoading={updateSuspensionMutation.isPending}
              >
                Konfirmasi
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
