import { ClientProjectDetailScreen } from "@/features/client-projects/components/client-project-detail-screen";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminClientProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ClientProjectDetailScreen projectId={id} mode="admin" />;
}
