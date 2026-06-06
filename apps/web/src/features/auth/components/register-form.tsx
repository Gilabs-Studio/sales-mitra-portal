"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { useRegisterForm } from "../hooks/use-auth";

export function RegisterForm() {
  const { form, isLoading, errorMessage, onSubmit } = useRegisterForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nama mitra</FieldLabel>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
        </Field>
      </FieldGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      <Button type="submit" isLoading={isLoading} className="w-full">
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Daftar
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </form>
  );
}
