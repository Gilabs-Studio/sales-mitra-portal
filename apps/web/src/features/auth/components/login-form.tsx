"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { useLoginForm } from "../hooks/use-auth";

export function LoginForm() {
  const { form, isLoading, errorMessage, onSubmit } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
        </Field>
      </FieldGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      <Button type="submit" isLoading={isLoading} className="w-full">
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Masuk
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-foreground underline underline-offset-4">
          Daftar sebagai mitra
        </Link>
      </p>
    </form>
  );
}
