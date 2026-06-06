"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "../schemas/auth.schema";
import { getMe, login, registerPartner } from "../services/auth.service";
import type { Role } from "../types/auth.types";
import { clearAccessToken, getAccessToken, setAccessToken } from "../utils/auth-storage";
import { useRouter } from "@/i18n/routing";

export function useLoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      setAccessToken(token);
      router.replace(user.role === "admin" ? "/admin" : "/partner", { locale });
    },
  });

  return {
    form,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    isLoading: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}

export function useRegisterForm() {
  const router = useRouter();
  const locale = useLocale();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: registerPartner,
    onSuccess: ({ token }) => {
      setAccessToken(token);
      router.replace("/partner", { locale });
    },
  });

  return {
    form,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    isLoading: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: Boolean(getAccessToken()),
    retry: 0,
  });
}

export function useAuthGuard(requiredRole?: Role) {
  const router = useRouter();
  const locale = useLocale();
  const hasToken = Boolean(getAccessToken());
  const query = useMe();

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login", { locale });
      return;
    }
    if (query.error) {
      clearAccessToken();
      router.replace("/login", { locale });
      return;
    }
    if (requiredRole && query.data && query.data.role !== requiredRole) {
      router.replace(query.data.role === "admin" ? "/admin" : "/partner", { locale });
    }
  }, [hasToken, locale, query.data, query.error, requiredRole, router]);

  return {
    user: query.data,
    isLoading: hasToken && query.isLoading,
    isAllowed: Boolean(query.data && (!requiredRole || query.data.role === requiredRole)),
  };
}

export function useLogout() {
  const router = useRouter();
  const locale = useLocale();

  return () => {
    clearAccessToken();
    router.replace("/login", { locale });
  };
}
