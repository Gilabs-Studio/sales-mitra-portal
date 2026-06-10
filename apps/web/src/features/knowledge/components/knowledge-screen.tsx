"use client";

import { Bot, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useChatbot, useKnowledge } from "../hooks/use-knowledge";
import { cn } from "@/lib/utils";

export function KnowledgeScreen() {
  const auth = useAuthGuard("partner");
  const knowledge = useKnowledge();
  const chatbot = useChatbot();
  const { register } = chatbot.form;

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
              Materi sales untuk menjelaskan layanan, SOP development, discovery, kualitas delivery, dan angle closing.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {knowledge.data?.map((article) => (
              <Link
                key={article.id}
                href={`/partner/knowledge/${article.id}`}
                className="rounded-lg border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/25"
              >
                <p className="text-xs font-semibold uppercase text-muted-foreground">{article.category}</p>
                <h2 className="mt-2 text-xl font-extrabold text-foreground">{article.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.content}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-foreground">
                  Buka detail
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </p>
              </Link>
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
              <Input placeholder="Tanya SOP, pricing, layanan, closing..." {...register("question")} />
              <Button type="submit" isLoading={chatbot.isLoading} aria-label="Kirim pertanyaan">
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {chatbot.errorMessage ? <FieldError>{chatbot.errorMessage}</FieldError> : null}
          </form>
        </aside>
      </div>
    </AppShell>
  );
}
