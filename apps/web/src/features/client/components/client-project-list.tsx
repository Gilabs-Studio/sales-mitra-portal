"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useClientProjects } from "../hooks/use-client";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ClientProjectList() {
  const auth = useAuthGuard("client");
  const t = useTranslations("client");
  const projectsQuery = useClientProjects();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const projects = projectsQuery.data ?? [];

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {t("projectTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar seluruh project aktif dan histori project Anda bersama GiLabs.
          </p>
        </div>

        {projectsQuery.isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : projectsQuery.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat daftar project. Silakan coba kembali.
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            <h3 className="text-md font-bold text-foreground">Belum ada project terdaftar</h3>
            <p className="mt-1 text-sm text-muted-foreground">Hubungi tim GiLabs untuk mendaftarkan project baru Anda.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <ScrollArea orientation="horizontal">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="border-b border-border px-4 py-3 w-[260px]">Nama Project</th>
                    <th className="border-b border-border px-4 py-3">Deskripsi</th>
                    <th className="border-b border-border px-4 py-3 w-[150px]">PIC</th>
                    <th className="border-b border-border px-4 py-3 w-[120px]">Mulai</th>
                    <th className="border-b border-border px-4 py-3 w-[120px]">Target</th>
                    <th className="border-b border-border px-4 py-3 w-[120px]">Status</th>
                    <th className="border-b border-border px-4 py-3 w-[100px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="align-top hover:bg-secondary/40 transition-colors">
                      <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                        <Link
                          href={`/client/projects/${p.id}`}
                          className="hover:text-primary transition-colors cursor-pointer block"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground max-w-[300px]">
                        <p className="line-clamp-2">{p.description}</p>
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <div className="font-semibold text-foreground">{p.picName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.picContact}</div>
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {p.startDate}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {p.targetEndDate}
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary capitalize">
                          {p.status}
                        </span>
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <Link
                          href={`/client/projects/${p.id}`}
                          className="inline-flex items-center text-xs font-extrabold text-primary hover:underline cursor-pointer"
                        >
                          Buka
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}
      </div>
    </AppShell>
  );
}
