"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  changePasswordSchema,
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerSchema,
  type LoginFormValues,
  type ChangePasswordFormValues,
  type PasswordResetConfirmFormValues,
  type PasswordResetRequestFormValues,
  type RegisterFormValues,
} from "../schemas/auth.schema";
import {
  confirmPasswordReset,
  changePassword,
  getMe,
  login,
  registerPartner,
  requestCurrentUserPasswordReset,
  requestPasswordReset,
  updateLeadEmailNotifications,
} from "../services/auth.service";
import { isAdminRole, rolePath, type Role } from "../types/auth.types";
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
      router.replace(`/${rolePath(user.role)}`, { locale });
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
    if (requiredRole && query.data) {
      const allowed = requiredRole === "admin" ? isAdminRole(query.data.role) : query.data.role === requiredRole;
      if (!allowed) {
        router.replace(`/${rolePath(query.data.role)}`, { locale });
      }
    }
  }, [hasToken, locale, query.data, query.error, requiredRole, router]);

  return {
    user: query.data,
    isLoading: hasToken && query.isLoading,
    isAllowed: Boolean(query.data && (!requiredRole || (requiredRole === "admin" ? isAdminRole(query.data.role) : query.data.role === requiredRole))),
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

export function usePasswordResetRequestForm(initialEmail = "") {
  const form = useForm<PasswordResetRequestFormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: initialEmail },
  });

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
  });

  return {
    form,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    successMessage: mutation.isSuccess ? "Jika email terdaftar, link reset password sudah dikirim." : "",
    isLoading: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}

export function useCurrentUserPasswordReset() {
  return useMutation({
    mutationFn: requestCurrentUserPasswordReset,
  });
}

export function useLeadEmailNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeadEmailNotifications,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword }),
  });

  return {
    form,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    successMessage: mutation.isSuccess ? "Password akun berhasil diperbarui." : "",
    isLoading: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}

export function usePasswordResetConfirmForm(token: string) {
  const form = useForm<PasswordResetConfirmFormValues>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: PasswordResetConfirmFormValues) =>
      confirmPasswordReset({ token, password: values.password }),
  });

  return {
    form,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    successMessage: mutation.isSuccess ? "Password baru berhasil disimpan. Silakan login kembali." : "",
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}
