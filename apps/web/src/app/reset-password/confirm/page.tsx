import { redirect } from "@/i18n/routing";

type ResetPasswordConfirmFallbackPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordConfirmFallbackPage({
  searchParams,
}: ResetPasswordConfirmFallbackPageProps) {
  const params = await searchParams;
  redirect({
    href: {
      pathname: "/reset-password/confirm",
      query: params.token ? { token: params.token } : undefined,
    },
    locale: "id",
  });
}
