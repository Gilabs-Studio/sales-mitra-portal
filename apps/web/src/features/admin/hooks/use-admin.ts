"use client";

import { useQuery } from "@tanstack/react-query";
import { listPartners } from "../services/admin.service";

export function useAdminPartners() {
  return useQuery({
    queryKey: ["admin", "partners"],
    queryFn: listPartners,
  });
}
