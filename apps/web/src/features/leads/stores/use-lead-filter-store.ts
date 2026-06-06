import { create } from "zustand";
import type { LeadStatus, ServiceType } from "../types/lead.types";

type LeadFilterState = {
  status: LeadStatus | "";
  serviceType: ServiceType | "";
  setStatus: (status: LeadStatus | "") => void;
  setServiceType: (serviceType: ServiceType | "") => void;
};

export const useLeadFilterStore = create<LeadFilterState>((set) => ({
  status: "",
  serviceType: "",
  setStatus: (status) => set({ status }),
  setServiceType: (serviceType) => set({ serviceType }),
}));
