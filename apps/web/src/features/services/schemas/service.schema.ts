import { z } from "zod";

export const serviceRuleSchema = z.object({
  type: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,48}$/, "Kode layanan memakai huruf kecil, angka, dan underscore"),
  label: z.string().trim().min(2, "Nama layanan minimal 2 karakter"),
  description: z.string().trim().min(8, "Deskripsi minimal 8 karakter"),
  minimumBudget: z.coerce.number().min(0, "Budget minimum tidak boleh negatif"),
  requiresDiscovery: z.coerce.boolean(),
  isActive: z.coerce.boolean(),
});

export type ServiceRuleInputValues = z.input<typeof serviceRuleSchema>;
export type ServiceRuleFormValues = z.output<typeof serviceRuleSchema>;
