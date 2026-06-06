import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type { AuthResult, LoginPayload, RegisterPayload, User } from "../types/auth.types";

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
