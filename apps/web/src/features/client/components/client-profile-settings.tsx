"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { KeyRound, ShieldAlert } from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useUpdateClientProfile } from "../hooks/use-client";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ClientProfileSettings() {
  const auth = useAuthGuard("client");
  const t = useTranslations("client");
  const updateProfile = useUpdateClientProfile();
  
  const [success, setSuccess] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (auth.user) {
      setValue("name", auth.user.name);
      setValue("email", auth.user.email);
    }
  }, [auth.user, setValue]);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const onSubmit = handleSubmit((data) => {
    setSuccess(null);
    setErrorMsg(null);

    if (data.password && data.password.length < 8) {
      setErrorMsg("Password baru harus minimal 8 karakter.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setErrorMsg("Password konfirmasi tidak cocok.");
      return;
    }

    const payload: { name: string; email: string; password?: string } = {
      name: data.name,
      email: data.email,
    };
    if (data.password) {
      payload.password = data.password;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        setSuccess("Profil dan password berhasil diperbarui.");
        setValue("password", "");
        setValue("confirmPassword", "");
      },
      onError: (err) => {
        setErrorMsg(err.message ?? "Terjadi kesalahan saat memperbarui profil.");
      },
    });
  });

  return (
    <AppShell user={auth.user}>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {t("clientSettings")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Perbarui nama lengkap, alamat email, atau ganti password keamanan akun Anda.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            {success && (
              <div className="rounded-md bg-teal-500/10 p-3 text-xs font-semibold text-teal-600 border border-teal-500/20">
                {success}
              </div>
            )}
            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <FieldGroup className="space-y-4">
              <Field className="space-y-2">
                <FieldLabel htmlFor="name">{t("rename")}</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  {...register("name", { required: true })}
                />
              </Field>

              <Field className="space-y-2">
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan alamat email Anda"
                  {...register("email", { required: true })}
                />
              </Field>

              <div className="border-t border-border/60 my-4 pt-4" />

              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 mb-2">
                <KeyRound className="h-4 w-4 text-primary" />
                Ganti Password Baru
              </h3>

              <Field className="space-y-2">
                <FieldLabel htmlFor="password">Password Baru</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password minimal 8 karakter"
                  {...register("password")}
                />
              </Field>

              <Field className="space-y-2">
                <FieldLabel htmlFor="confirmPassword">Konfirmasi Password Baru</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ketik ulang password baru Anda"
                  {...register("confirmPassword")}
                />
              </Field>
            </FieldGroup>

            <div className="mt-6">
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full justify-center min-h-11 font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/30"
              >
                {updateProfile.isPending ? "Menyimpan..." : t("saveChanges")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
