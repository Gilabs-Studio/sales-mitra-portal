"use client";

import * as React from "react";
import { ArrowLeft, Building2, Mail, Phone, Clock, Star, Search, Info, MessageSquare } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { StatusBadge } from "@/features/leads/components/status-badge";
import { LeadChat } from "@/features/leads/components/lead-chat";
import { AdminLeadStatusForm } from "./admin-lead-status-form";
import {
  useAdminLeadDetail,
  useLeadEvents,
  useAdminLeads,
  useLeadFilters,
  useLeadMessages,
  statusOptions,
} from "@/features/leads/hooks/use-leads";
import { serviceLabel, statusLabels } from "@/features/leads/utils/lead-labels";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useLeadWebSocket } from "@/features/leads/hooks/use-lead-ws";
import { useQueryClient } from "@tanstack/react-query";

const MONTH_MAP: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
};

function parseMeetingDate(msg: string): Date | null {
  if (!msg) return null;
  const match = msg.match(/(?:📅 Jadwal meeting diatur:\s*)?\w+,\s*(\d+)\s*(\w+)\s*(\d{4})\s*pukul\s*(\d{2}):(\d{2})/i);
  if (!match) return null;
  const [_, dayStr, monthName, yearStr, hourStr, minStr] = match;
  const month = MONTH_MAP[monthName.toLowerCase()];
  if (month === undefined) return null;
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  return new Date(year, month, day, hour, min);
}

function getMeetingReminder(msg: string): string | null {
  const meetingDate = parseMeetingDate(msg);
  if (!meetingDate) return null;
  
  const now = new Date();
  const diffMs = meetingDate.getTime() - now.getTime();
  if (diffMs <= 0) return null; // already passed
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `Tinggal ${diffDays} hari lagi`;
  }
  if (diffHours > 0) {
    return `Tinggal ${diffHours} jam lagi`;
  }
  if (diffMins > 0) {
    return `Tinggal ${diffMins} menit lagi`;
  }
  return "Mulai sekarang";
}

function MeetingReminder({ msg }: { msg: string }) {
  const [reminder, setReminder] = React.useState<string | null>(null);

  React.useEffect(() => {
    const update = () => {
      setReminder(getMeetingReminder(msg));
    };
    update();
    const interval = setInterval(update, 15000); // update every 15s
    return () => clearInterval(interval);
  }, [msg]);

  if (!reminder) return null;

  return (
    <div className="mt-1.5 text-[9px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1 transition-all duration-300">
      <Clock className="h-2.5 w-2.5 shrink-0 animate-pulse" />
      {reminder}
    </div>
  );
}

type AdminLeadDetailScreenProps = {
  leadId: string;
};

export function AdminLeadDetailScreen({ leadId }: AdminLeadDetailScreenProps) {
  const auth = useAuthGuard("admin");
  const lead = useAdminLeadDetail(leadId ?? "");
  const events = useLeadEvents(leadId ?? "", "admin");
  const leads = useAdminLeads();
  const [chatLimit, setChatLimit] = React.useState(15);
  const messages = useLeadMessages(leadId ?? "", "admin", chatLimit);
  const { page, setPage, status, setStatus, serviceType, setServiceType } = useLeadFilters();
  const [search, setSearch] = React.useState("");
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isChatPage = pathname.includes("/chat");

  // Reset chat limit when active lead changes
  React.useEffect(() => {
    setChatLimit(15);
  }, [leadId]);

  // Invalidate leads queries to update sidebar/badges when lead chat is opened
  React.useEffect(() => {
    if (leadId) {
      void queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    }
  }, [leadId, queryClient]);

  // Initialize real-time WebSocket connection (only if leadId is set)
  useLeadWebSocket(leadId ?? "", "admin");

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  if (leadId && lead.isLoading) {
    return (
      <AppShell user={auth.user}>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (leadId && (lead.isError || !lead.data)) {
    return (
      <AppShell user={auth.user}>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
          Lead tidak ditemukan.
        </div>
      </AppShell>
    );
  }

  const l = lead.data;
  const paginationMeta = leads.data;

  // Filter client-side by search query
  const filteredLeads = (leads.data?.data ?? []).filter((item) => {
    return (
      item.companyName.toLowerCase().includes(search.toLowerCase()) ||
      item.contactName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Parse meeting schedule from the latest message matching calendar schedule syntax
  const scheduledMeeting = (() => {
    if (!messages.data) return null;
    const meetingMsg = [...messages.data]
      .reverse()
      .find((msg) => msg.message.startsWith("📅 Jadwal meeting diatur:"));
    if (!meetingMsg) return null;
    return meetingMsg.message.replace("📅 Jadwal meeting diatur:", "").trim();
  })();

  return (
    <AppShell user={auth.user} noPadding>
      <div className="flex flex-1 min-h-0 divide-x divide-border bg-background overflow-hidden">
        {/* Left Column: Chat List / Leads Sidebar */}
        <div className="hidden md:flex w-80 lg:w-96 border-r border-border bg-card flex-col h-full shrink-0">
          {/* Sidebar Header */}
          <div className="p-3 border-b border-border space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari prospek..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="flex-1 min-h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Semua Status</option>
                {statusOptions.map((item) => (
                  <option key={item || "all"} value={item}>
                    {item ? statusLabels[item] : "Semua status"}
                  </option>
                ))}
              </select>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="flex-1 min-h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Semua Layanan</option>
                <option value="company_profile">Company Profile</option>
                <option value="website_app">Website App</option>
                <option value="custom_software">Custom Software</option>
                <option value="salesview">SalesView</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Sidebar List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
            {leads.isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Tidak ada prospek</div>
            ) : (
              filteredLeads.map((item) => {
                const active = item.id === leadId;
                const hasUnread = item.unreadCount > 0;
                return (
                  <Link
                    key={item.id}
                    href={isChatPage ? `/admin/chat?id=${item.id}` : `/admin/leads/${item.id}`}
                    className={cn(
                      "flex items-center gap-3 p-3 text-left transition-colors cursor-pointer hover:bg-secondary/40",
                      active ? "bg-primary/10 border-l-2 border-primary" : ""
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground font-semibold">
                      {item.companyName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-foreground truncate">{item.companyName}</h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground truncate">{item.contactName}</p>
                        <div className="flex items-center gap-1.5">
                          {hasUnread && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                              {item.unreadCount}
                            </span>
                          )}
                          <StatusBadge status={item.status} className="scale-75 origin-right shrink-0" />
                        </div>
                      </div>
                      {item.meetingMessage && <MeetingReminder msg={item.meetingMessage} />}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Sidebar Pagination */}
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className="p-2 border-t border-border bg-card shrink-0 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Hal {paginationMeta.page}/{paginationMeta.totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={paginationMeta.page <= 1}
                  onClick={() => setPage(paginationMeta.page - 1)}
                  className="px-2 py-1 rounded-lg border border-border bg-background cursor-pointer hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                >
                  Prev
                </button>
                <button
                  disabled={paginationMeta.page >= paginationMeta.totalPages}
                  onClick={() => setPage(paginationMeta.page + 1)}
                  className="px-2 py-1 rounded-lg border border-border bg-background cursor-pointer hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {leadId && l ? (
          <>
            {/* Center Column: Chat Panel */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-secondary/10 relative">
              <LeadChat
                leadId={leadId}
                role="admin"
                title={l.companyName}
                subtitle={`${serviceLabel(l.serviceType)} · ${l.contactName}`}
                limit={chatLimit}
                onLoadMore={() => setChatLimit((prev) => prev + 15)}
                hasMore={messages.data ? messages.data.length >= chatLimit : true}
                headerActions={
                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/admin/leads"
                      className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setRightPanelOpen(!rightPanelOpen)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer"
                      title="Detail Prospek"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                }
                className="flex-1 h-full"
              />
            </div>

            {/* Right Column: Lead Detail Sidebar */}
            {rightPanelOpen && (
              <div className="w-80 lg:w-96 border-l border-border bg-card flex flex-col h-full shrink-0 overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Detail Prospek
                  </h3>
                  <button
                    onClick={() => setRightPanelOpen(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                  >
                    Tutup
                  </button>
                </div>

                <div className="p-4 space-y-6">
                  {/* Lead Company & Basic Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={l.status} />
                      <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Star className="h-3.5 w-3.5 text-warning" />
                        Score: {l.qualificationScore}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-foreground leading-snug">{l.companyName}</h2>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Mitra: <span className="font-semibold text-foreground">{l.partnerName} ({l.partnerCode})</span></div>
                      <div>Budget: <span className="font-semibold text-foreground">{l.budget > 0 ? formatCurrency(l.budget) : "Discovery"}</span></div>
                      <div>Layanan: <span className="font-semibold text-foreground">{serviceLabel(l.serviceType)}</span></div>
                      <div>Dibuat: <span className="font-semibold text-foreground">{formatDate(l.createdAt)}</span></div>
                    </div>
                  </div>

                  {/* Status form (Admin Update Status) */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Update Status</h4>
                    <AdminLeadStatusForm lead={l} />
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Kontak</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-foreground">
                        <span className="font-semibold">{l.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground truncate" title={l.contactEmail}>
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {l.contactEmail}
                      </div>
                      {l.contactPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {l.contactPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Meeting Info */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Jadwal Meeting
                    </h4>
                    {scheduledMeeting ? (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed">
                        <div className="font-semibold text-primary">Meeting terkonfirmasi:</div>
                        <div className="mt-1 text-foreground font-medium">{scheduledMeeting}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        Belum ada jadwal meeting. Klik ikon kalender di chat untuk menjadwalkan.
                      </div>
                    )}
                  </div>

                  {/* Note & Qualification Note */}
                  {l.qualificationNote && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Catatan Kualifikasi</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/30 p-2.5 rounded-lg border border-border">
                        {l.qualificationNote}
                      </p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Timeline Status</h4>
                    {events.isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : events.data?.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Belum ada aktivitas</p>
                    ) : (
                      <ol className="relative border-l border-border pl-3 ml-1.5 space-y-4">
                        {events.data?.map((ev) => (
                          <li key={ev.id} className="relative pl-3">
                            <div className="absolute -left-[16px] top-1.5 h-2 w-2 rounded-full border border-border bg-card" />
                            <div className="text-xs font-semibold text-foreground">
                              {statusLabels[ev.status] ?? ev.status}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDate(ev.createdAt)}
                            </div>
                            {ev.note && <p className="text-[10px] text-muted-foreground mt-1 bg-secondary/20 p-1 rounded-sm">{ev.note}</p>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-secondary/5 text-muted-foreground p-8 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-bold text-foreground">GiLabs Chat Prospek</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Pilih salah satu prospek dari daftar di sebelah kiri untuk melihat rincian detail, timeline aktivitas, dan bertukar pesan secara real-time.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

