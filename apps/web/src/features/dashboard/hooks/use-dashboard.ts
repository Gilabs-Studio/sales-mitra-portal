"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard, getPartnerDashboard } from "../services/dashboard.service";

export function usePartnerDashboard() {
  return useQuery({
    queryKey: ["partner", "dashboard"],
    queryFn: getPartnerDashboard,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboard,
  });
}
