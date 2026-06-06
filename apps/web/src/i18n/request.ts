import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import globalEn from "./messages/en.json";
import globalId from "./messages/id.json";
import { authEn } from "@/features/auth/i18n/en";
import { authId } from "@/features/auth/i18n/id";
import { leadsEn } from "@/features/leads/i18n/en";
import { leadsId } from "@/features/leads/i18n/id";
import { dashboardEn } from "@/features/dashboard/i18n/en";
import { dashboardId } from "@/features/dashboard/i18n/id";
import { knowledgeEn } from "@/features/knowledge/i18n/en";
import { knowledgeId } from "@/features/knowledge/i18n/id";
import { adminEn } from "@/features/admin/i18n/en";
import { adminId } from "@/features/admin/i18n/id";

const messages = {
  en: {
    ...globalEn,
    auth: authEn,
    leads: leadsEn,
    dashboard: dashboardEn,
    knowledge: knowledgeEn,
    admin: adminEn,
  },
  id: {
    ...globalId,
    auth: authId,
    leads: leadsId,
    dashboard: dashboardId,
    knowledge: knowledgeId,
    admin: adminId,
  },
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as "id" | "en")
    ? (requested as "id" | "en")
    : routing.defaultLocale;

  return {
    locale,
    messages: messages[locale],
  };
});
