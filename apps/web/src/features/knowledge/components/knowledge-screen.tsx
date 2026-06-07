"use client";

import * as React from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { cn } from "@/lib/utils";
import { getKnowledgeDetail } from "../knowledge-details";
import type { KnowledgeArticle } from "../types/knowledge.types";
import { useChatbot, useKnowledge } from "../hooks/use-knowledge";

export function KnowledgeScreen() {
  const auth = useAuthGuard("partner");
  const knowledge = useKnowledge();
  const chatbot = useChatbot();
  const { register } = chatbot.form;
  const [activeArticle, setActiveArticle] = React.useState<KnowledgeArticle | null>(null);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Product knowledge center</h1>
            <p className="mt-2 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
              Materi ringkas agar mitra dapat menjelaskan layanan, budget minimum, dan kebutuhan discovery.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {knowledge.data?.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setActiveArticle(article)}
                className="rounded-lg border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/25"
              >
                <p className="text-xs font-semibold uppercase text-muted-foreground">{article.category}</p>
                <h2 className="mt-2 text-xl font-extrabold text-foreground">{article.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.content}</p>
                {getKnowledgeDetail(article) ? (
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-foreground">
                    Buka detail
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-foreground">AI chatbot mitra</h2>
          </div>
          <div className="mt-4 h-[420px] space-y-3 overflow-y-auto rounded-lg border border-border bg-secondary p-3">
            {chatbot.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[90%] rounded-lg border border-border bg-card p-3 text-sm leading-6",
                  message.role === "user" ? "ml-auto" : "mr-auto",
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
          <form onSubmit={chatbot.onSubmit} className="mt-4 space-y-2">
            <div className="flex gap-2">
              <Input placeholder="Tanya soal pricing, layanan, referral..." {...register("question")} />
              <Button type="submit" isLoading={chatbot.isLoading} aria-label="Kirim pertanyaan">
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {chatbot.errorMessage ? <FieldError>{chatbot.errorMessage}</FieldError> : null}
          </form>
        </aside>
      </div>
      {activeArticle ? (
        <KnowledgeDetailDialog
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      ) : null}
    </AppShell>
  );
}

function KnowledgeDetailDialog({
  article,
  onClose,
}: {
  article: KnowledgeArticle;
  onClose: () => void;
}) {
  const detail = getKnowledgeDetail(article);

  return (
    <>
      <button
        type="button"
        aria-label="Tutup detail knowledge"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/45"
      />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{article.category}</p>
            <h3 className="mt-1 text-2xl font-extrabold text-foreground">{article.title}</h3>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Tutup
          </Button>
        </div>
        <div className="max-h-[calc(85vh-84px)] overflow-y-auto px-5 py-5">
          <p className="text-sm leading-7 text-muted-foreground">
            {detail?.overview ?? article.content}
          </p>
          {detail?.sections.map((section) => (
            <section key={section.title} className="mt-6 space-y-3">
              <div>
                <h4 className="text-lg font-extrabold text-foreground">{section.title}</h4>
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
                    <summary className="cursor-pointer list-none text-sm font-bold text-foreground">
                      {item.title}
                    </summary>
                    {item.summary ? (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                    ) : null}
                    {item.bullets?.length ? (
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                        {item.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2">
                            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-foreground/70" />
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
      </div>
    </>
  );
}
