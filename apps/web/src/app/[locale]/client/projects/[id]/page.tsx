import { ClientProjectDetail } from "@/features/client/components/client-project-detail";

export default async function ClientProjectDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <ClientProjectDetail projectId={id} />;
}
