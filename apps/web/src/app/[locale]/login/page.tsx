import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell title="Masuk ke portal" description="Gunakan akun admin, mitra, atau client untuk mengakses dashboard">
      <LoginForm />
    </AuthShell>
  );
}
