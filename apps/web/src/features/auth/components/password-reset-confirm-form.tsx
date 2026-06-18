"use client";

import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Link } from "@/i18n/routing";
import { usePasswordResetConfirmForm } from "../hooks/use-auth";

type PasswordResetConfirmFormProps = {
  token: string;
};

export function PasswordResetConfirmForm({ token }: PasswordResetConfirmFormProps) {
  const { form, isLoading, isSuccess, errorMessage, successMessage, onSubmit } = usePasswordResetConfirmForm(token);
  const {
    register,
    formState: { errors },
  } = form;

  if (!token) {
    return <FieldError>Token reset password tidak ditemukan.</FieldError>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">Password baru</FieldLabel>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
          {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Konfirmasi password baru</FieldLabel>
          <PasswordInput id="confirmPassword" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword ? <FieldError>{errors.confirmPassword.message}</FieldError> : null}
        </Field>
      </FieldGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      {successMessage ? <p className="text-sm font-semibold text-emerald-600">{successMessage}</p> : null}
      <Button type="submit" isLoading={isLoading} className="w-full" disabled={isSuccess}>
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        Simpan password baru
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">
          Kembali ke login
        </Link>
      </p>
    </form>
  );
}
