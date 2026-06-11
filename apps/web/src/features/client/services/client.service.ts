import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type {
  ClientDashboardData,
  Project,
  ProjectProgress,
  ProjectDocument,
  ProjectMaintenance,
  MaintenanceLog,
  ProjectInvoice,
} from "../types/client.types";

export async function getClientDashboard() {
  const response = await apiClient.get<ApiEnvelope<ClientDashboardData>>("/client/dashboard");
  return unwrapApiResponse(response.data);
}

export async function listClientProjects() {
  const response = await apiClient.get<ApiEnvelope<Project[]>>("/client/projects");
  return unwrapApiResponse(response.data);
}

export async function getClientProject(id: string) {
  const response = await apiClient.get<ApiEnvelope<Project>>(`/client/projects/${id}`);
  return unwrapApiResponse(response.data);
}

export async function getProjectProgress(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<ProjectProgress[]>>(`/client/projects/${projectId}/progress`);
  return unwrapApiResponse(response.data);
}

export async function getProjectMaintenance(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<ProjectMaintenance[]>>(`/client/projects/${projectId}/maintenance`);
  return unwrapApiResponse(response.data);
}

export async function getProjectMaintenanceLogs(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<MaintenanceLog[]>>(`/client/projects/${projectId}/maintenance-logs`);
  return unwrapApiResponse(response.data);
}

export async function getProjectInvoices(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<ProjectInvoice[]>>(`/client/projects/${projectId}/invoices`);
  return unwrapApiResponse(response.data);
}

export async function getProjectDocuments(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<ProjectDocument[]>>(`/client/projects/${projectId}/documents`);
  return unwrapApiResponse(response.data);
}

export async function getProjectReportData(projectId: string) {
  const response = await apiClient.get<ApiEnvelope<any>>(`/client/projects/${projectId}/reports`);
  return unwrapApiResponse(response.data);
}

export async function updateClientProfile(payload: { name: string; email: string; password?: string }) {
  const response = await apiClient.patch<ApiEnvelope<Record<string, never>>>("/client/profile", payload);
  return unwrapApiResponse(response.data);
}

export async function createMaintenanceRequest(projectId: string, payload: { description: string; maintenanceId: string }) {
  const response = await apiClient.post<ApiEnvelope<MaintenanceLog>>(`/client/projects/${projectId}/maintenance-requests`, payload);
  return unwrapApiResponse(response.data);
}
