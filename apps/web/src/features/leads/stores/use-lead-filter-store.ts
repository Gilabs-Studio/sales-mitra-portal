import { create } from "zustand";
import type { LeadStatus, ServiceType } from "../types/lead.types";

type LeadFilterState = {
  status: LeadStatus | "";
  serviceType: ServiceType | "";
  page: number;
  setStatus: (status: LeadStatus | "") => void;
  setServiceType: (serviceType: ServiceType | "") => void;
  setPage: (page: number) => void;
};

export const useLeadFilterStore = create<LeadFilterState>((set) => ({
  status: "",
  serviceType: "",
  page: 1,
  setStatus: (status) => set({ status, page: 1 }), // reset page on filter change
  setServiceType: (serviceType) => set({ serviceType, page: 1 }),
  setPage: (page) => set({ page }),
}));
