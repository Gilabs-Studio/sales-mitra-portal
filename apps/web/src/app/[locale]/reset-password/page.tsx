import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordResetRequestForm } from "@/features/auth/components/password-reset-request-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthShell title="Reset password" description="Masukkan email akun untuk menerima link reset password sekali pakai">
      <PasswordResetRequestForm initialEmail={params.email ?? ""} />
    </AuthShell>
  );
}
