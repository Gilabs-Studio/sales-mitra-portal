import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan wajib diisi"),
  contactName: z.string().min(2, "Nama kontak wajib diisi"),
  contactEmail: z.string().email("Email kontak tidak valid"),
  contactPhone: z.string().optional().default(""),
  serviceType: z.enum(["company_profile", "website_app", "custom_software", "salesview"]),
  budget: z.coerce.number().min(0, "Budget tidak boleh negatif"),
  needSummary: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["submitted", "qualified", "contacted", "won", "lost", "rejected"]),
  note: z.string().optional().default(""),
});

export type LeadFormInputValues = z.input<typeof leadSchema>;
export type LeadFormValues = z.output<typeof leadSchema>;
export type UpdateLeadStatusInputValues = z.input<typeof updateLeadStatusSchema>;
export type UpdateLeadStatusFormValues = z.output<typeof updateLeadStatusSchema>;
