"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center select-none">
      <div className="max-w-md">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-6">
          Error 404
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-foreground leading-[1.1] mb-4">
          {t("title")}
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
          {t("description")}
        </p>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-foreground hover:text-accent border-b border-foreground/30 hover:border-accent transition-all duration-300 pb-0.5 cursor-pointer"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
