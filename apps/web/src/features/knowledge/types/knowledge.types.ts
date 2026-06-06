export type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
};

export type ChatbotAnswer = {
  answer: string;
  matchedArticles: KnowledgeArticle[];
};
