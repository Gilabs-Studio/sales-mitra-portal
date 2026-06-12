"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginForm } from "@/features/auth/hooks/use-auth";

export function ClientLoginScreen() {
  const t = useTranslations("client");
  const { form, isLoading, errorMessage, onSubmit } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-primary/5 via-background to-teal-500/5 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Image
            src="/Logo.png"
            alt="GiLabs"
            width={120}
            height={36}
            className="h-9 w-auto object-contain mb-4"
            priority
          />
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight text-center">
            {t("loginTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
            {t("loginSubtitle")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <FieldGroup className="space-y-4">
            <Field className="space-y-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@perusahaan.com"
                {...register("email")}
              />
              {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
            </Field>
            <Field className="space-y-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
            </Field>
          </FieldGroup>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full justify-center min-h-11 font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/30"
          >
            Masuk Portal
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/40">
          GiLabs Studio © {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
