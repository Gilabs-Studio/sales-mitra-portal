import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type {
  AuthResult,
  ChangePasswordPayload,
  LoginPayload,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  RegisterPayload,
  User,
} from "../types/auth.types";

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<ApiEnvelope<AuthResult>>("/auth/login", payload);
  return unwrapApiResponse(response.data);
}

export async function registerPartner(payload: RegisterPayload) {
  const response = await apiClient.post<ApiEnvelope<AuthResult>>("/auth/register", payload);
  return unwrapApiResponse(response.data);
}

export async function getMe() {
  const response = await apiClient.get<ApiEnvelope<User>>("/me");
  return unwrapApiResponse(response.data);
}

export async function requestPasswordReset(payload: PasswordResetRequestPayload) {
  const response = await apiClient.post<ApiEnvelope<Record<string, never>>>("/auth/password-reset/request", payload);
  return unwrapApiResponse(response.data);
}

export async function requestCurrentUserPasswordReset() {
  const response = await apiClient.post<ApiEnvelope<Record<string, never>>>("/me/password-reset");
  return unwrapApiResponse(response.data);
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await apiClient.post<ApiEnvelope<Record<string, never>>>("/me/password-change", payload);
  return unwrapApiResponse(response.data);
}

export async function confirmPasswordReset(payload: PasswordResetConfirmPayload) {
  const response = await apiClient.post<ApiEnvelope<Record<string, never>>>("/auth/password-reset/confirm", payload);
  return unwrapApiResponse(response.data);
}
