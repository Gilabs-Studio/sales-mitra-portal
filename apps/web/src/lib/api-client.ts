import axios, { AxiosError } from "axios";
import { clearAccessToken, getAccessToken } from "@/features/auth/utils/auth-storage";

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiErrorPayload;
};

export class ApiClientError extends Error {
  code: string;
  details?: string;
  status?: number;

  constructor(message: string, code: string, details?: string, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (error.response?.status === 401) {
      clearAccessToken();
    }
    const payload = error.response?.data?.error;
    throw new ApiClientError(
      payload?.message ?? "Request gagal diproses",
      payload?.code ?? "REQUEST_ERROR",
      payload?.details,
      error.response?.status,
    );
  },
);

export function unwrapApiResponse<T>(response: ApiEnvelope<T>): T {
  if (!response.success || response.data === undefined) {
    throw new ApiClientError(
      response.error?.message ?? response.message,
      response.error?.code ?? "API_ERROR",
      response.error?.details,
    );
  }
  return response.data;
}
