"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Link } from "@/i18n/routing";
import { useLoginForm } from "../hooks/use-auth";

export function LoginForm() {
  const { form, isLoading, errorMessage, onSubmit } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;
  const suspendedMessage = errorMessage.toLowerCase().includes("disuspend");

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email atau username</FieldLabel>
          <Input id="email" type="text" autoComplete="username" {...register("email")} />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
          {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
        </Field>
      </FieldGroup>
      {errorMessage ? (
        suspendedMessage ? (
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            {errorMessage}
          </div>
        ) : (
          <FieldError>{errorMessage}</FieldError>
        )
      ) : null}
      <Button type="submit" isLoading={isLoading} className="w-full">
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Masuk
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/reset-password" className="font-semibold text-foreground underline underline-offset-4">
          Lupa password?
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-foreground underline underline-offset-4">
          Daftar sebagai mitra
        </Link>
      </p>
    </form>
  );
}
