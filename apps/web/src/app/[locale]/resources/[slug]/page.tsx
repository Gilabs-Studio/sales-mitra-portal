import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Link, routing, type Locale } from "@/i18n/routing";
import {
  getAllResourceStaticParams,
  getPartnerResource,
} from "@/features/resources/resources";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllResourceStaticParams();
}

export default async function PartnerResourcePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const resource = getPartnerResource(locale, slug);
  if (!resource) {
    notFound();
  }

  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-accent selection:text-foreground">
      <header className="border-b border-border/30 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <Link href="/" className="inline-flex cursor-pointer select-none items-center">
            <Image
              src="/Logo.png"
              alt="GiLabs"
              width={96}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isEn ? "Register Now" : "Daftar Sekarang"}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <Link
          href="/#sumber"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isEn ? "Back to resources" : "Kembali ke sumber"}
        </Link>

        <div className="mt-8 max-w-3xl">
          <span className="inline-flex rounded bg-secondary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {resource.tag}
          </span>
          <h1 className="mt-5 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {resource.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
            {resource.description}
          </p>
          {resource.ctaHref && resource.ctaLabel ? (
            <Link
              href={resource.ctaHref}
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0"
            >
              {resource.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        <div className="mt-12 space-y-6">
          {resource.sections.map((section) => {
            const isLongDocument = section.body && section.body.includes("\n");
            return (
              <section
                key={section.title}
                className="rounded-lg border border-border bg-card p-5 md:p-7"
              >
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {section.title}
                </h2>
                {section.body ? (
                  isLongDocument ? (
                    <pre className="mt-5 whitespace-pre-wrap rounded-lg bg-secondary p-5 font-sans text-sm leading-7 text-muted-foreground">
                      {section.body}
                    </pre>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {section.body}
                    </p>
                  )
                ) : null}
                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>
      </article>
    </main>
  );
}
