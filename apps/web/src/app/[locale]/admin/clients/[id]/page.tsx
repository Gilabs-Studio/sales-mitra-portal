import { AdminClientDetailScreen } from "@/features/client-projects/components/admin-client-detail-screen";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminClientDetailScreen clientId={id} />;
}
