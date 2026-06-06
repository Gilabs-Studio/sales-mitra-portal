import { AdminLeadDetailScreen } from "@/features/admin/components/admin-lead-detail-screen";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminLeadDetailPage({ params }: Props) {
  const { id } = await params;
  return <AdminLeadDetailScreen leadId={id} />;
}
