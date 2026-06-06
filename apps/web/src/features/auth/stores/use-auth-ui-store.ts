import { create } from "zustand";

type AuthUiState = {
  intent: "login" | "register";
  setIntent: (intent: "login" | "register") => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  intent: "login",
  setIntent: (intent) => set({ intent }),
}));
