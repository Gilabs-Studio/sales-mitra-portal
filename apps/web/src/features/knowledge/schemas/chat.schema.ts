import { z } from "zod";

export const chatSchema = z.object({
  question: z.string().min(3, "Pertanyaan minimal 3 karakter"),
});

export type ChatFormValues = z.infer<typeof chatSchema>;
