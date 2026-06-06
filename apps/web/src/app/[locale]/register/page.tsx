import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthShell title="Daftar sebagai mitra" description="Buat akun mitra dan langsung mulai submit prospek ke GiLabs.">
      <RegisterForm />
    </AuthShell>
  );
}
