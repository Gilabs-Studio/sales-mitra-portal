"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/features/auth/utils/auth-storage";
import type { LeadMessage } from "../types/lead.types";

type WsEvent = {
  type: "message";
  data: LeadMessage;
};

function buildWsUrl(leadId: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
  const token = getAccessToken();

  // Convert http(s) → ws(s), or handle relative paths
  let base = apiBase;
  if (base.startsWith("/")) {
    const loc = typeof window !== "undefined" ? window.location : null;
    if (loc) {
      const protocol = loc.protocol === "https:" ? "wss:" : "ws:";
      base = `${protocol}//${loc.host}${base}`;
    }
  } else {
    base = base.replace(/^https?/, (m) => (m === "https" ? "wss" : "ws"));
  }

  // Use partner endpoint by default; the server's auth middleware verifies the token regardless
  return `${base}/partner/leads/${leadId}/ws?token=${encodeURIComponent(token)}`;
}

/**
 * Opens a WebSocket connection to the lead chat room and appends
 * incoming messages directly into the react-query cache.
 * Returns a boolean indicating whether the socket is connected.
 */
export function useLeadWebSocket(
  leadId: string,
  role: "partner" | "admin",
): { connected: boolean } {
  const queryClient = useQueryClient();
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    if (!leadId || typeof window === "undefined") return;

    // Use the role-specific WS endpoint
    const wsUrl = buildWsUrl(leadId).replace("/partner/leads/", `/${role}/leads/`);

    let ws: WebSocket;
    let destroyed = false;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!destroyed) setConnected(true);
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const parsed = JSON.parse(event.data) as WsEvent;
          if (parsed.type === "message" && parsed.data) {
            const msg = parsed.data;
            // Append message to react-query cache without refetch
            queryClient.setQueriesData<LeadMessage[]>(
              { queryKey: [role, "leads", leadId, "messages"] },
              (old) => {
                const existing = old ?? [];
                // Deduplicate by id
                if (existing.some((m) => m.id === msg.id)) return existing;
                return [...existing, msg];
              },
            );
            // Invalidate other leads queries to update sidebars and header badges
            void queryClient.invalidateQueries({ queryKey: [role, "leads"] });
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        if (!destroyed) {
          setConnected(false);
          // Reconnect after 2s on unexpected close
          setTimeout(() => {
            if (!destroyed) connect();
          }, 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      destroyed = true;
      setConnected(false);
      ws?.close();
    };
  }, [leadId, role, queryClient]);

  return { connected };
}
