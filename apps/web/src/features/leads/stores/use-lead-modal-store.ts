import { create } from "zustand";

type LeadModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useLeadModalStore = create<LeadModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
