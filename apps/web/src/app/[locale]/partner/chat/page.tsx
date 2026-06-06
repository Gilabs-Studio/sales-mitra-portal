import { PartnerLeadDetailScreen } from "@/features/leads/components/partner-lead-detail-screen";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function PartnerChatPage({ searchParams }: Props) {
  const { id } = await searchParams;
  return <PartnerLeadDetailScreen leadId={id ?? ""} />;
}
