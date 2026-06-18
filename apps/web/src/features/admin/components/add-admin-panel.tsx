"use client";

import * as React from "react";
import { ShieldPlus } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { useCreateAdmin } from "../hooks/use-admin";

const initialForm = {
  name: "",
  username: "",
  email: "",
  password: "",
};

export function AddAdminPanel() {
  const mutation = useCreateAdmin();
  const [form, setForm] = React.useState(initialForm);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await mutation.mutateAsync(form);
    setForm(initialForm);
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <ShieldPlus className="h-4 w-4 text-primary" aria-hidden="true" />
        Tambah Admin
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Fitur ini hanya untuk super admin. Admin baru akan mendapatkan akses area admin yang sama, tanpa hak menambah admin lain.
      </p>
      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          Nama
          <input
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          Username
          <input
            required
            value={form.username}
            onChange={(event) => updateField("username", event.target.value)}
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          Password
          <PasswordInput
            required
            minLength={8}
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
        </label>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan admin"}
          </button>
          {mutation.isSuccess ? (
            <p className="text-sm font-semibold text-emerald-600">Admin baru berhasil ditambahkan.</p>
          ) : null}
          {mutation.error instanceof Error ? (
            <p className="text-sm font-semibold text-destructive">{mutation.error.message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
