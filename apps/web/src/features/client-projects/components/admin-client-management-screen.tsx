"use client";

import * as React from "react";
import { ArrowRight, Mail, Plus, RotateCcw, Users } from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import {
  useAdminClients,
  useCreateClient,
  useSendClientInvitation,
} from "../hooks/use-client-projects";
import type { ClientWithStats } from "../types/client-project.types";
import { Link } from "@/i18n/routing";

export function AdminClientManagementScreen() {
  const auth = useAuthGuard("admin");
  const clients = useAdminClients(1, 100);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Client management</p>
            <h1 className="mt-2 text-4xl font-extrabold text-foreground">Kelola akses client</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Buat akun client, kirim invitation/reset akses, dan pantau jumlah project serta invoice tertunggak dari setiap client.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            Total: {clients.data?.total ?? 0} client
          </div>
        </div>

        {clients.isError ? (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Daftar client gagal dimuat.
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
          <CreateClientPanel />
          <ClientList clients={clients.data?.data ?? []} />
        </div>
      </div>
    </AppShell>
  );
}

function CreateClientPanel() {
  const createClient = useCreateClient();
  const [values, setValues] = React.useState({
    name: "",
    email: "",
    password: "",
    sendInvitation: true,
  });

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
        Tambah client
      </div>
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          createClient.mutate(values, {
            onSuccess: () => setValues({ name: "", email: "", password: "", sendInvitation: true }),
          });
        }}
      >
        <Field>
          <FieldLabel>Nama client</FieldLabel>
          <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
        </Field>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />
        </Field>
        <Field>
          <FieldLabel>Password awal</FieldLabel>
          <Input
            type="password"
            value={values.password}
            placeholder="Opsional jika invitation aktif"
            onChange={(event) => setValues({ ...values, password: event.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={values.sendInvitation}
            onChange={(event) => setValues({ ...values, sendInvitation: event.target.checked })}
          />
          Kirim invitation email
        </label>
        <Button type="submit" className="w-full" isLoading={createClient.isPending}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          Buat client
        </Button>
        {createClient.error instanceof Error ? (
          <p className="text-xs font-semibold text-destructive">{createClient.error.message}</p>
        ) : null}
        {createClient.isSuccess ? (
          <p className="text-xs font-semibold text-success">Client berhasil dibuat.</p>
        ) : null}
      </form>
    </section>
  );
}

function ClientList({ clients }: { clients: ClientWithStats[] }) {
  if (clients.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Belum ada akun client.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <ScrollArea orientation="horizontal">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-4 py-3">Client</th>
              <th className="border-b border-border px-4 py-3 text-center">Project</th>
              <th className="border-b border-border px-4 py-3 text-center">Maintenance</th>
              <th className="border-b border-border px-4 py-3 text-center">Invoice</th>
              <th className="border-b border-border px-4 py-3">Dibuat</th>
              <th className="border-b border-border px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </section>
  );
}

function ClientRow({ client }: { client: ClientWithStats }) {
  const invitation = useSendClientInvitation();

  return (
    <tr className="align-middle transition-colors hover:bg-secondary/40">
      <td className="border-b border-border px-4 py-3">
        <p className="font-extrabold text-foreground">{client.name}</p>
        <p className="text-xs text-muted-foreground">{client.email}</p>
      </td>
      <td className="border-b border-border px-4 py-3 text-center font-bold text-foreground">{client.totalProjects}</td>
      <td className="border-b border-border px-4 py-3 text-center font-bold text-success">{client.maintenanceProjects}</td>
      <td className="border-b border-border px-4 py-3 text-center font-bold text-warning">{client.unpaidInvoices}</td>
      <td className="border-b border-border px-4 py-3 text-muted-foreground">{formatDate(client.createdAt)}</td>
      <td className="border-b border-border px-4 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={invitation.isPending}
            onClick={() => invitation.mutate(client.id)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
          <Link
            href={`/admin/client-projects?clientId=${client.id}`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 text-xs font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Project
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
