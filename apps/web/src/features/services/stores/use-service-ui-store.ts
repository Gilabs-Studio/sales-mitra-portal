import { create } from "zustand";
import type { ServiceRule } from "../types/service.types";

type ServiceUIState = {
  editingService: ServiceRule | null;
  deletingService: ServiceRule | null;
  setEditingService: (service: ServiceRule | null) => void;
  setDeletingService: (service: ServiceRule | null) => void;
};

export const useServiceUIStore = create<ServiceUIState>((set) => ({
  editingService: null,
  deletingService: null,
  setEditingService: (service) => set({ editingService: service }),
  setDeletingService: (service) => set({ deletingService: service }),
}));
