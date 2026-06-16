"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { getKnowledgeDetail } from "../knowledge-details";
import { useKnowledge } from "../hooks/use-knowledge";
import type { KnowledgeArticle } from "../types/knowledge.types";

type KnowledgeDetailScreenProps = {
  articleId: string;
};

export function KnowledgeDetailScreen({ articleId }: KnowledgeDetailScreenProps) {
  const auth = useAuthGuard("partner");
  const knowledge = useKnowledge();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const article = knowledge.data?.find((item) => item.id === articleId);

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/partner/knowledge"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            aria-label="Kembali ke knowledge"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Knowledge detail</p>
            <h1 className="text-3xl font-sans font-medium tracking-tight text-foreground">
              {article?.title ?? "Detail knowledge"}
            </h1>
          </div>
        </div>

        {knowledge.isLoading ? (
          <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
            Memuat detail knowledge...
          </div>
        ) : article ? (
          <KnowledgeDetailBody article={article} />
        ) : (
          <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
            Artikel tidak ditemukan.
          </div>
        )}
      </div>
    </AppShell>
  );
}

function KnowledgeDetailBody({ article }: { article: KnowledgeArticle }) {
  const detail = getKnowledgeDetail(article);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{article.category}</p>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {detail?.overview ?? article.content}
      </p>

      <div className="mt-6 space-y-6">
        {detail?.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <div>
              <h2 className="text-lg font-sans font-semibold tracking-tight text-foreground">{section.title}</h2>
              {section.summary ? (
                <p className="mt-1 text-sm text-muted-foreground">{section.summary}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.title}
                  className="rounded-lg border border-border bg-background px-4 py-3"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground font-sans">
                    <span>{item.title}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </summary>
                  {item.summary ? (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                  ) : null}
                  {item.bullets?.length ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className="mt-1.75 h-1.5 w-1.5 rounded-full bg-foreground/70" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/partner/knowledge"
          className="inline-flex items-center rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-[#e8e6dc]"
        >
          Kembali ke knowledge
        </Link>
      </div>
    </div>
  );
}
