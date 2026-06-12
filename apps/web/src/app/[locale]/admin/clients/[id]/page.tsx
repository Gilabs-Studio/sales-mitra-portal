import { ClientDetailScreen } from "@/features/admin/components/client-detail-screen";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminClientDetailPage({ params }: Props) {
  const { id } = await params;
  return <ClientDetailScreen clientId={id} />;
}
