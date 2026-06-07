"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdmin, listAdmins, listPartners, updateUserSuspension } from "../services/admin.service";

export function useAdminPartners() {
  return useQuery({
    queryKey: ["admin", "partners"],
    queryFn: listPartners,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: listAdmins,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserSuspension(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { isSuspended: boolean; reason: string }) =>
      updateUserSuspension(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["partner"] });
    },
  });
}
