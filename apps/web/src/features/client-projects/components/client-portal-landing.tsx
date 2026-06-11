import Image from "next/image";
import { CheckCircle2, FileText, FolderKanban, ReceiptText, Wrench } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Link } from "@/i18n/routing";

export function ClientPortalLanding() {
  return (
    <main className="min-h-screen bg-background">
      <header className="py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center">
            <Image src="/Logo.png" alt="GiLabs" width={96} height={32} className="h-7 w-auto object-contain" priority />
          </Link>
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            Login umum
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="pt-8">
          <p className="text-sm font-semibold uppercase text-muted-foreground">Portal Client GiLabs</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-foreground">
            Pantau project, dokumen, maintenance, dan invoice dari satu portal.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Admin GiLabs membuat akun dan project terlebih dahulu, lalu detail akses dikirim melalui email atau WhatsApp. Setelah login, client dapat mengubah nama, email, dan password akun.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { Icon: FolderKanban, title: "Project monitoring", body: "Status, target selesai, PIC, dan progress timeline." },
              { Icon: FileText, title: "Dokumen & deliverables", body: "Preview PDF dan download dokumen project." },
              { Icon: Wrench, title: "Maintenance audit", body: "Kuota, histori request, status, dan PIC." },
              { Icon: ReceiptText, title: "Invoice billing", body: "Status invoice, due date, nominal, dan PDF." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-border bg-card p-4">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-3 font-extrabold text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-border bg-secondary p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" aria-hidden="true" />
              <div>
                <p className="font-extrabold text-foreground">Flow akses client</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Admin membuat akun client, membuat project, lalu sistem mengirim invitation email. Admin juga dapat mengirim pesan manual melalui email atau WhatsApp sesuai kebutuhan operasional.
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-6">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Login client</p>
            <h2 className="mt-2 text-2xl font-extrabold text-foreground">Masuk memakai akun dari admin</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Gunakan email dan password/invitation yang dikirim tim GiLabs.
            </p>
          </div>
          <div className="mt-6">
            <LoginForm hideRegisterLink />
          </div>
        </aside>
      </section>
    </main>
  );
}
