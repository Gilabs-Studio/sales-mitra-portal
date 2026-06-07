"use client";

import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChangePasswordForm } from "../hooks/use-auth";

export function ChangePasswordForm() {
  const { form, isLoading, errorMessage, successMessage, onSubmit } = useChangePasswordForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="oldPassword">Password lama</FieldLabel>
          <Input id="oldPassword" type="password" autoComplete="current-password" {...register("oldPassword")} />
          {errors.oldPassword ? <FieldError>{errors.oldPassword.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="newPassword">Password baru</FieldLabel>
          <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
          {errors.newPassword ? <FieldError>{errors.newPassword.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Konfirmasi password baru</FieldLabel>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword ? <FieldError>{errors.confirmPassword.message}</FieldError> : null}
        </Field>
      </FieldGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      {successMessage ? <p className="text-sm font-semibold text-emerald-600">{successMessage}</p> : null}
      <Button type="submit" isLoading={isLoading} className="w-full">
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        Simpan password baru
      </Button>
    </form>
  );
}
