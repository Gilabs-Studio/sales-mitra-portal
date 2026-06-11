import { redirect } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminClientProjectsPage({ params }: PageProps) {
  const { locale } = await params;
  redirect({ href: "/admin/clients", locale });
}
