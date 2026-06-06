import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type { ChatbotAnswer, KnowledgeArticle } from "../types/knowledge.types";

export async function listKnowledge() {
  const response = await apiClient.get<ApiEnvelope<KnowledgeArticle[]>>("/knowledge");
  return unwrapApiResponse(response.data);
}

export async function askChatbot(question: string) {
  const response = await apiClient.post<ApiEnvelope<ChatbotAnswer>>("/chatbot/ask", { question });
  return unwrapApiResponse(response.data);
}
