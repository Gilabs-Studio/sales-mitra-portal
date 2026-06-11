"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClient,
  createClientProject,
  createMaintenanceLog,
  createProjectDocument,
  createProjectInvoice,
  createProjectProgress,
  getAdminClientProject,
  getAdminClient,
  getClientDashboard,
  getClientProject,
  listAdminClientProjects,
  listAdminClients,
  listClientProjects,
  sendClientInvitation,
  updateClientProject,
  updateProjectInvoice,
  upsertMaintenancePlan,
} from "../services/client-project.service";
import type {
  CreateClientPayload,
  DocumentPayload,
  InvoicePayload,
  MaintenanceLogPayload,
  MaintenancePlanPayload,
  ProgressPayload,
  ProjectPayload,
} from "../types/client-project.types";

export function useAdminClients(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["admin", "clients", page, pageSize],
    queryFn: () => listAdminClients({ page, pageSize }),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => createClient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
  });
}

export function useSendClientInvitation() {
  return useMutation({
    mutationFn: (clientId: string) => sendClientInvitation(clientId),
  });
}

export function useAdminClient(clientId: string) {
  return useQuery({
    queryKey: ["admin", "clients", clientId],
    queryFn: () => getAdminClient(clientId),
    enabled: !!clientId,
  });
}

export function useAdminClientProjects(clientId?: string) {
  return useQuery({
    queryKey: ["admin", "client-projects", clientId ?? "all"],
    queryFn: () => listAdminClientProjects(clientId),
  });
}

export function useCreateClientProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => createClientProject(payload),
    onSuccess: (_project, payload) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients", payload.clientId] });
    },
  });
}

export function useUpdateClientProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => updateClientProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });
}

export function useAdminClientProject(projectId: string) {
  return useQuery({
    queryKey: ["admin", "client-projects", projectId],
    queryFn: () => getAdminClientProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProjectProgress(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProgressPayload) => createProjectProgress(projectId, payload),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useCreateProjectDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentPayload) => createProjectDocument(projectId, payload),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useUpsertMaintenancePlan(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MaintenancePlanPayload) => upsertMaintenancePlan(projectId, payload),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useCreateMaintenanceLog(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MaintenanceLogPayload) => createMaintenanceLog(projectId, payload),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useCreateProjectInvoice(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoicePayload) => createProjectInvoice(projectId, payload),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useUpdateProjectInvoice(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: string; payload: InvoicePayload }) =>
      updateProjectInvoice(invoiceId, payload),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useClientDashboard() {
  return useQuery({
    queryKey: ["client", "dashboard"],
    queryFn: getClientDashboard,
  });
}

export function useClientProjects() {
  return useQuery({
    queryKey: ["client", "projects"],
    queryFn: listClientProjects,
  });
}

export function useClientProject(projectId: string) {
  return useQuery({
    queryKey: ["client", "projects", projectId],
    queryFn: () => getClientProject(projectId),
    enabled: !!projectId,
  });
}

function invalidateProject(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "client-projects"] });
  void queryClient.invalidateQueries({ queryKey: ["admin", "client-projects", projectId] });
  void queryClient.invalidateQueries({ queryKey: ["client"] });
}
