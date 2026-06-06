import { create } from "zustand";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "Silakan tanya soal layanan GiLabs, budget minimum, referral code, atau SalesView.",
    },
  ],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  reset: () =>
    set({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Silakan tanya soal layanan GiLabs, budget minimum, referral code, atau SalesView.",
        },
      ],
    }),
}));
