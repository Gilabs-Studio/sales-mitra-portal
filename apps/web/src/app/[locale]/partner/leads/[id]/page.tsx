import { PartnerLeadDetailScreen } from "@/features/leads/components/partner-lead-detail-screen";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function PartnerLeadDetailPage({ params }: Props) {
  const { id } = await params;
  return <PartnerLeadDetailScreen leadId={id} />;
}
