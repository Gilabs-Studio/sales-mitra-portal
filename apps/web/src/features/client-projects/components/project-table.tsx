"use client";

import { ArrowRight, FileClock, Wrench } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateOnly } from "../utils/format";
import type { ClientProject } from "../types/client-project.types";
import { StatusPill } from "./status-pill";

export function ProjectTable({
  projects,
  role,
}: {
  projects: ClientProject[];
  role: "admin" | "client";
}) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
        Belum ada project client untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <ScrollArea orientation="horizontal">
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-4 py-3">Project</th>
              {role === "admin" ? <th className="border-b border-border px-4 py-3">Client</th> : null}
              <th className="border-b border-border px-4 py-3">Status</th>
              <th className="border-b border-border px-4 py-3">Progress</th>
              <th className="border-b border-border px-4 py-3">PIC</th>
              <th className="border-b border-border px-4 py-3">Target</th>
              <th className="border-b border-border px-4 py-3">Signal</th>
              <th className="border-b border-border px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const href = role === "admin" ? `/admin/client-projects/${project.id}` : `/client/projects/${project.id}`;
              return (
                <tr key={project.id} className="align-top transition-colors hover:bg-secondary/40">
                  <td className="border-b border-border px-4 py-3">
                    <Link href={href} className="font-extrabold text-foreground transition-colors hover:text-primary">
                      {project.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 max-w-[320px] text-xs leading-5 text-muted-foreground">
                      {project.description || "Tidak ada deskripsi"}
                    </p>
                  </td>
                  {role === "admin" ? (
                    <td className="border-b border-border px-4 py-3">
                      <p className="font-semibold text-foreground">{project.clientName || "-"}</p>
                      <p className="text-xs text-muted-foreground">{project.clientEmail || "-"}</p>
                    </td>
                  ) : null}
                  <td className="border-b border-border px-4 py-3">
                    <StatusPill type="project" status={project.status} />
                  </td>
                  <td className="border-b border-border px-4 py-3">
                    <div className="flex min-w-40 items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${project.progressPercent}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs font-bold text-foreground">{project.progressPercent}%</span>
                    </div>
                    {project.latestProgressNote ? (
                      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{project.latestProgressNote}</p>
                    ) : null}
                  </td>
                  <td className="border-b border-border px-4 py-3">
                    <p className="font-semibold text-foreground">{project.picName || "-"}</p>
                    <p className="text-xs text-muted-foreground">{project.picEmail || "-"}</p>
                  </td>
                  <td className="border-b border-border px-4 py-3 text-muted-foreground">
                    {formatDateOnly(project.targetEndDate)}
                  </td>
                  <td className="border-b border-border px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      {project.maintenanceActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                          <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                          Maintenance aktif
                        </span>
                      ) : null}
                      {project.unpaidInvoiceCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                          <FileClock className="h-3.5 w-3.5" aria-hidden="true" />
                          {project.unpaidInvoiceCount} invoice belum dibayar
                        </span>
                      ) : null}
                      {!project.maintenanceActive && project.unpaidInvoiceCount === 0 ? (
                        <span className="text-xs text-muted-foreground">Normal</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="border-b border-border px-4 py-3 text-right">
                    <Link
                      href={href}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary active:translate-y-0"
                    >
                      Detail
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
