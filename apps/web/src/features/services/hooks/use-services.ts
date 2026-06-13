"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { serviceRuleSchema, type ServiceRuleFormValues, type ServiceRuleInputValues } from "../schemas/service.schema";
import {
  deleteService,
  getPublicServiceCatalog,
  listAdminServices,
  updateService,
  upsertService,
} from "../services/services.service";
import { useServiceUIStore } from "../stores/use-service-ui-store";
import type { ServiceType } from "@/features/leads/types/lead.types";
import type { ServiceRule, ServiceRulePayload } from "../types/service.types";

const defaultValues: ServiceRuleInputValues = {
  type: "other",
  label: "",
  description: "",
  minimumBudget: 0,
  requiresDiscovery: true,
  isActive: true,
};

export function useServiceCatalog() {
  return useQuery({
    queryKey: ["services"],
    queryFn: getPublicServiceCatalog,
  });
}

export function useAdminServices() {
  return useQuery({
    queryKey: ["admin", "services"],
    queryFn: listAdminServices,
  });
}

export function useServiceAdminForm() {
  const queryClient = useQueryClient();
  const editingService = useServiceUIStore((state) => state.editingService);
  const setEditingService = useServiceUIStore((state) => state.setEditingService);

  const form = useForm<ServiceRuleInputValues, unknown, ServiceRuleFormValues>({
    resolver: zodResolver(serviceRuleSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!editingService) {
      form.reset(defaultValues);
      return;
    }

    form.reset({
      type: editingService.type,
      label: editingService.label,
      description: editingService.description,
      minimumBudget: editingService.minimumBudget,
      requiresDiscovery: editingService.requiresDiscovery,
      isActive: editingService.isActive,
    });
  }, [editingService, form]);

  const mutation = useMutation({
    mutationFn: (values: ServiceRulePayload) =>
      editingService ? updateService(editingService.type, values) : upsertService(values),
    onSuccess: () => {
      form.reset(defaultValues);
      setEditingService(null);
      useServiceUIStore.getState().setIsFormOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  return {
    form,
    editingService,
    isLoading: mutation.isPending,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    onCancel: () => {
      setEditingService(null);
      useServiceUIStore.getState().setIsFormOpen(false);
    },
    onSubmit: form.handleSubmit((values) => mutation.mutate(toServicePayload(values))),
  };
}

export function useDeleteServiceAction() {
  const queryClient = useQueryClient();
  const deletingService = useServiceUIStore((state) => state.deletingService);
  const setDeletingService = useServiceUIStore((state) => state.setDeletingService);

  const mutation = useMutation({
    mutationFn: (service: ServiceRule) => deleteService(service.type),
    onSuccess: () => {
      setDeletingService(null);
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  return {
    deletingService,
    isLoading: mutation.isPending,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    setDeletingService,
    onConfirm: async () => {
      if (deletingService) {
        await mutation.mutateAsync(deletingService);
      }
    },
  };
}

function toServicePayload(values: ServiceRuleFormValues): ServiceRulePayload {
  return {
    type: values.type as ServiceType,
    label: values.label,
    description: values.description,
    minimumBudget: values.minimumBudget,
    requiresDiscovery: values.requiresDiscovery,
    isActive: values.isActive,
  };
}
