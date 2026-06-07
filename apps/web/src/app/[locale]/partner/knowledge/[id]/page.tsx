import { KnowledgeDetailScreen } from "@/features/knowledge/components/knowledge-detail-screen";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PartnerKnowledgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <KnowledgeDetailScreen articleId={id} />;
}
