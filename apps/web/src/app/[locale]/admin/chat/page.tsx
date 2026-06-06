import { AdminLeadDetailScreen } from "@/features/admin/components/admin-lead-detail-screen";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function AdminChatPage({ searchParams }: Props) {
  const { id } = await searchParams;
  return <AdminLeadDetailScreen leadId={id ?? ""} />;
}
