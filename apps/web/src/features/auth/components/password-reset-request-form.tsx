"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { usePasswordResetRequestForm } from "../hooks/use-auth";

type PasswordResetRequestFormProps = {
  initialEmail?: string;
};

export function PasswordResetRequestForm({ initialEmail = "" }: PasswordResetRequestFormProps) {
  const { form, isLoading, errorMessage, successMessage, onSubmit } = usePasswordResetRequestForm(initialEmail);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email akun</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
        </Field>
      </FieldGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      {successMessage ? <p className="text-sm font-semibold text-emerald-600">{successMessage}</p> : null}
      <Button type="submit" isLoading={isLoading} className="w-full">
        <Mail className="h-4 w-4" aria-hidden="true" />
        Kirim link reset password
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Sudah ingat password?{" "}
        <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">
          Kembali ke login
        </Link>
      </p>
    </form>
  );
}
