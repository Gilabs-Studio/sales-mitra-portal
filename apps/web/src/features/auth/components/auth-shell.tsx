import { Link } from "@/i18n/routing";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <section className="flex flex-col justify-between border-b border-border pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
          <Link href="/" className="text-sm font-extrabold text-foreground">
            GiLabs Mitra Portal
          </Link>
          <div className="max-w-2xl py-12">
            <p className="text-sm font-semibold uppercase text-muted-foreground">Partner ecosystem</p>
            <h1 className="mt-4 max-w-xl text-5xl font-bold leading-[1.05] text-foreground md:text-6xl">
              Kemitraan IT untuk komisi project yang lebih transparan
            </h1>
            <p className="mt-6 max-w-xl font-serif text-xl leading-8 text-muted-foreground">
              Submit lead, pantau pipeline, pelajari product knowledge, dan gunakan referral code dari satu partner portal
            </p>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Kredensial admin default dikelola melalui env dan seeder backend
          </p>
        </section>
        <section className="flex items-center">
          <div className="w-full rounded-lg border border-border bg-card p-5">
            <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
