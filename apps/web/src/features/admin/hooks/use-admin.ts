"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdmin, listAdmins, listPartners } from "../services/admin.service";

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
