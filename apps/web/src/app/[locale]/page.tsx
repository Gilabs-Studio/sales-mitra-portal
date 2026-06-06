import { ArrowRight, Bot, ShieldCheck, Users } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-extrabold text-foreground">
            GiLabs Mitra Portal
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">
              Masuk
            </Link>
            <Link href="/register" className="rounded-lg border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
              Daftar mitra
            </Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_520px] lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase text-muted-foreground">Partner-led growth</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.04] text-foreground md:text-6xl">
            Kemitraan IT untuk komisi project yang lebih transparan
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-xl leading-8 text-muted-foreground">
            Daftar sebagai mitra GiLabs, submit lead software, pantau status prospek, dan buka peluang passive income dari jaringan Anda
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Mulai sebagai mitra
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Masuk dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="border-b border-border pb-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Live workflow</p>
            <h2 className="mt-2 text-2xl font-extrabold text-foreground">Lead qualification</h2>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["Company Profile", "Budget >= Rp10 juta", "Qualified"],
              ["Website/App", "Budget >= Rp15 juta", "Qualified"],
              ["Custom Software", "Discovery form lengkap", "Submitted"],
              ["Lainnya", "Kebutuhan dikurasi admin", "Discovery"],
            ].map(([service, rule, status]) => (
              <div key={service} className="grid grid-cols-[1fr_auto] gap-4 rounded-lg border border-border bg-secondary p-4">
                <div>
                  <p className="font-semibold text-foreground">{service}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{rule}</p>
                </div>
                <span className="h-fit rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 md:grid-cols-3">
          {[
            { Icon: Users, title: "Mitra organik", body: "Registrasi mandiri tanpa interview dan onboarding panjang" },
            { Icon: ShieldCheck, title: "Filter lead", body: "Budget dan kebutuhan disaring sebelum tim internal turun meeting" },
            { Icon: Bot, title: "Knowledge + chatbot", body: "Mitra belajar layanan, pricing, referral, dan studi kasus" },
          ].map(({ Icon, title, body }) => (
            <article key={title} className="rounded-lg border border-border bg-card p-5">
              <Icon className="h-5 w-5" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-extrabold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
