import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClientDashboard,
  getClientProject,
  getProjectDocuments,
  getProjectInvoices,
  getProjectMaintenance,
  getProjectMaintenanceLogs,
  getProjectProgress,
  getProjectReportData,
  listClientProjects,
  updateClientProfile,
  createMaintenanceRequest,
  getClientNotifications,
} from "../services/client.service";

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

export function useClientProjectDetail(id: string) {
  return useQuery({
    queryKey: ["client", "projects", id],
    queryFn: () => getClientProject(id),
    enabled: !!id,
  });
}

export function useProjectProgress(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "progress"],
    queryFn: () => getProjectProgress(projectId),
    enabled: !!projectId && enabled,
  });
}

export function useProjectMaintenance(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "maintenance"],
    queryFn: () => getProjectMaintenance(projectId),
    enabled: !!projectId && enabled,
    retry: false, // Might not have maintenance package
  });
}

export function useProjectMaintenanceLogs(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "maintenance-logs"],
    queryFn: () => getProjectMaintenanceLogs(projectId),
    enabled: !!projectId && enabled,
  });
}

export function useProjectInvoices(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "invoices"],
    queryFn: () => getProjectInvoices(projectId),
    enabled: !!projectId && enabled,
  });
}

export function useProjectDocuments(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "documents"],
    queryFn: () => getProjectDocuments(projectId),
    enabled: !!projectId && enabled,
  });
}

export function useProjectReportData(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "reports"],
    queryFn: () => getProjectReportData(projectId),
    enabled: !!projectId && enabled,
  });
}

export function useUpdateClientProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClientProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useCreateMaintenanceRequest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { description: string; maintenanceId: string }) => createMaintenanceRequest(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "reports"] });
    },
  });
}

export function useCreateMaintenanceRequestGeneric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: { description: string; maintenanceId: string } }) =>
      createMaintenanceRequest(projectId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", variables.projectId, "maintenance"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", variables.projectId, "maintenance-logs"] });
    },
  });
}

export function useClientMaintenanceActivities(projectIds: string[]) {
  const maintenanceQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ["client", "projects", projectId, "maintenance-logs"],
      queryFn: () => getProjectMaintenanceLogs(projectId),
      enabled: !!projectId,
      refetchInterval: 10000,
    })),
  });

  const data = maintenanceQueries
    .flatMap((query) => query.data ?? [])
    .sort((left, right) => {
      const leftDate = new Date(left.createdAt || left.requestDate).getTime();
      const rightDate = new Date(right.createdAt || right.requestDate).getTime();
      return rightDate - leftDate;
    });

  return {
    data,
    isLoading: maintenanceQueries.some((query) => query.isLoading),
    isFetching: maintenanceQueries.some((query) => query.isFetching),
    isError: maintenanceQueries.some((query) => query.isError),
  };
}

export function useClientNotifications(page = 1, pageSize = 5) {
  return useQuery({
    queryKey: ["client", "notifications", page, pageSize],
    queryFn: () => getClientNotifications(page, pageSize),
  });
}
