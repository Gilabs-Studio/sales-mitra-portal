import { create } from "zustand";
import type { ServiceRule } from "../types/service.types";

type ServiceUIState = {
  editingService: ServiceRule | null;
  deletingService: ServiceRule | null;
  isFormOpen: boolean;
  setEditingService: (service: ServiceRule | null) => void;
  setDeletingService: (service: ServiceRule | null) => void;
  setIsFormOpen: (open: boolean) => void;
};

export const useServiceUIStore = create<ServiceUIState>((set) => ({
  editingService: null,
  deletingService: null,
  isFormOpen: false,
  setEditingService: (service) => set({ editingService: service }),
  setDeletingService: (service) => set({ deletingService: service }),
  setIsFormOpen: (open) => set({ isFormOpen: open }),
}));
