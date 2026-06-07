import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordResetConfirmForm } from "@/features/auth/components/password-reset-confirm-form";

type ResetPasswordConfirmPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordConfirmPage({ searchParams }: ResetPasswordConfirmPageProps) {
  const params = await searchParams;

  return (
    <AuthShell title="Buat password baru" description="Gunakan token reset sekali pakai dari email untuk menyimpan password baru">
      <PasswordResetConfirmForm token={params.token ?? ""} />
    </AuthShell>
  );
}
