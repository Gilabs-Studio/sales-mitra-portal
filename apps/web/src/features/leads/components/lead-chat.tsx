"use client";

import * as React from "react";
import { Send, MessageCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeadMessages, useSendMessage } from "../hooks/use-leads";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MeetingDialog, MeetingTrigger } from "./meeting-dialog";

type LeadChatProps = {
  leadId: string;
  role: "partner" | "admin";
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  limit: number;
  onLoadMore: () => void;
  hasMore: boolean;
};

export function LeadChat({
  leadId,
  role,
  title,
  subtitle,
  headerActions,
  className,
  limit,
  onLoadMore,
  hasMore,
}: LeadChatProps) {
  const messages = useLeadMessages(leadId, role, limit);
  const sendMutation = useSendMessage(leadId, role);
  const [text, setText] = React.useState("");
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastMsgIdRef = React.useRef<string | null>(null);

  const [prevScrollHeight, setPrevScrollHeight] = React.useState<number>(0);
  const [prevScrollTop, setPrevScrollTop] = React.useState<number>(0);

  // Scroll to bottom or keep scroll position on load
  React.useEffect(() => {
    if (!messages.data || messages.data.length === 0) return;

    const lastMsg = messages.data[messages.data.length - 1];
    const prevLastMsgId = lastMsgIdRef.current;
    lastMsgIdRef.current = lastMsg.id;

    if (!prevLastMsgId) {
      // First load: scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    } else if (lastMsg.id !== prevLastMsgId) {
      // New message appended at the bottom: scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.data]);

  // Restore scroll height difference to prevent jump when older messages load
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prevScrollHeight > 0) {
      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeight;
      container.scrollTop = prevScrollTop + heightDifference;
      setPrevScrollHeight(0);
    }
  }, [messages.data, prevScrollHeight, prevScrollTop]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // When scrolled to top, trigger load more if there's more to load
    if (container.scrollTop === 0 && hasMore && !messages.isFetching) {
      setPrevScrollHeight(container.scrollHeight);
      setPrevScrollTop(container.scrollTop);
      onLoadMore();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed, {
      onSuccess: () => setText(""),
    });
  };

  return (
    <div className={cn("flex flex-col bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0 bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-foreground leading-tight">{title || "Chat"}</div>
            {subtitle && <div className="text-xs text-muted-foreground leading-tight mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 space-y-3 overflow-y-auto p-4 bg-secondary/20"
      >
        {messages.isFetching && messages.data && (
          <div className="flex items-center justify-center py-1 text-[11px] text-muted-foreground bg-background/50 rounded-sm mb-2">
            Memuat chat lama...
          </div>
        )}
        {messages.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.data?.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada pesan. Mulai percakapan!
          </p>
        ) : (
          messages.data?.map((msg) => {
            const isSelf = msg.senderRole === role;
            const isMeetingMsg = msg.message.startsWith("📅 Jadwal meeting diatur:");
            return (
              <div key={msg.id} className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-xs",
                    isMeetingMsg
                      ? "border border-primary/20 bg-primary/10 text-foreground"
                      : isSelf
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border",
                  )}
                >
                  {!isSelf && (
                    <div className="mb-0.5 text-xs font-semibold opacity-70">{msg.senderName}</div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <div
                    className={cn(
                      "mt-1 text-[10px] opacity-60",
                      isSelf ? "text-right" : "text-left",
                    )}
                  >
                    {formatDate(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border p-3 shrink-0 bg-card"
      >
        <MeetingTrigger
          scheduled={null}
          onClick={() => setIsMeetingDialogOpen(true)}
          className="shrink-0"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Ketik pesan... (Enter untuk kirim)"
          rows={1}
          className="min-h-10 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button
          type="submit"
          isLoading={sendMutation.isPending}
          disabled={!text.trim()}
          className="shrink-0 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Meeting Dialog */}
      <MeetingDialog
        open={isMeetingDialogOpen}
        onClose={() => setIsMeetingDialogOpen(false)}
        onConfirm={(meeting) => {
          const dayName = meeting.date.toLocaleDateString("id-ID", { weekday: "long" });
          const dateStr = meeting.date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
          const textMsg = `📅 Jadwal meeting diatur: ${dayName}, ${dateStr} pukul ${meeting.time}`;
          sendMutation.mutate(textMsg);
        }}
      />
    </div>
  );
}

