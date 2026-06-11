import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type {
  ClientDashboard,
  ClientProject,
  ClientProjectDetail,
  CreateClientPayload,
  DocumentPayload,
  InvoicePayload,
  MaintenanceLogPayload,
  MaintenancePlanPayload,
  PaginatedClients,
  ProgressPayload,
  ProjectDocument,
  ProjectInvoice,
  ProjectPayload,
  ProjectProgress,
  MaintenanceLog,
  MaintenancePlan,
} from "../types/client-project.types";
import type { User } from "@/features/auth/types/auth.types";

export async function listAdminClients(params: { page?: number; pageSize?: number } = {}) {
  const response = await apiClient.get<ApiEnvelope<PaginatedClients>>("/admin/clients", { params });
  return unwrapApiResponse(response.data);
}

export async function createClient(payload: CreateClientPayload) {
  const response = await apiClient.post<ApiEnvelope<User>>("/admin/clients", payload);
  return unwrapApiResponse(response.data);
}

export async function sendClientInvitation(clientId: string) {
  const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(`/admin/clients/${clientId}/invitation`);
  return unwrapApiResponse(response.data);
}

export async function listAdminClientProjects(clientId?: string) {
  const response = await apiClient.get<ApiEnvelope<ClientProject[]>>("/admin/client-projects", {
    params: clientId ? { clientId } : undefined,
  });
  return unwrapApiResponse(response.data);
}

export async function createClientProject(payload: ProjectPayload) {
  const response = await apiClient.post<ApiEnvelope<ClientProject>>("/admin/client-projects", payload);
  return unwrapApiResponse(response.data);
}

export async function updateClientProject(projectId: string, payload: ProjectPayload) {
  const response = await apiClient.patch<ApiEnvelope<ClientProject>>(`/admin/client-projects/${projectId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function getAdminClientProject(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<ClientProjectDetail>>(`/admin/client-projects/${projectId}`);
  return unwrapApiResponse(response.data);
}

export async function createProjectProgress(projectId: string, payload: ProgressPayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectProgress>>(`/admin/client-projects/${projectId}/progress`, payload);
  return unwrapApiResponse(response.data);
}

export async function createProjectDocument(projectId: string, payload: DocumentPayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectDocument>>(`/admin/client-projects/${projectId}/documents`, payload);
  return unwrapApiResponse(response.data);
}

export async function upsertMaintenancePlan(projectId: string, payload: MaintenancePlanPayload) {
  const response = await apiClient.post<ApiEnvelope<MaintenancePlan>>(`/admin/client-projects/${projectId}/maintenance`, payload);
  return unwrapApiResponse(response.data);
}

export async function createMaintenanceLog(projectId: string, payload: MaintenanceLogPayload) {
  const response = await apiClient.post<ApiEnvelope<MaintenanceLog>>(`/admin/client-projects/${projectId}/maintenance/logs`, payload);
  return unwrapApiResponse(response.data);
}

export async function createProjectInvoice(projectId: string, payload: InvoicePayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectInvoice>>(`/admin/client-projects/${projectId}/invoices`, payload);
  return unwrapApiResponse(response.data);
}

export async function updateProjectInvoice(invoiceId: string, payload: InvoicePayload) {
  const response = await apiClient.patch<ApiEnvelope<ProjectInvoice>>(`/admin/client-invoices/${invoiceId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function getClientDashboard() {
  const response = await apiClient.get<ApiEnvelope<ClientDashboard>>("/client/dashboard");
  return unwrapApiResponse(response.data);
}

export async function listClientProjects() {
  const response = await apiClient.get<ApiEnvelope<ClientProject[]>>("/client/projects");
  return unwrapApiResponse(response.data);
}

export async function getClientProject(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<ClientProjectDetail>>(`/client/projects/${projectId}`);
  return unwrapApiResponse(response.data);
}
