import { AdminProjectDetailScreen } from "@/features/admin/components/admin-project-detail-screen";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminProjectDetailPage({ params }: Props) {
  const { id } = await params;
  return <AdminProjectDetailScreen projectId={id} />;
}
