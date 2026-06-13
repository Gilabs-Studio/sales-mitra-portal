const DEFAULT_PUBLIC_API_BASE = "/api/v1";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getPublicApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) {
    return DEFAULT_PUBLIC_API_BASE;
  }

  const normalized = trimTrailingSlash(configured);
  if (normalized.endsWith("/api/v1")) {
    return normalized;
  }

  if (/^https?:\/\//.test(normalized)) {
    return `${normalized}/api/v1`;
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function getPublicAssetOrigin() {
  const apiBase = getPublicApiBaseUrl();

  if (apiBase.startsWith("/")) {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.origin;
  }

  return apiBase.replace(/\/api\/v1$/, "");
}

export function getWebSocketApiBaseUrl() {
  const apiBase = getPublicApiBaseUrl();

  if (apiBase.startsWith("/")) {
    const loc = typeof window !== "undefined" ? window.location : null;
    if (!loc) {
      return apiBase;
    }

    const protocol = loc.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${loc.host}${apiBase}`;
  }

  return apiBase.replace(/^https?/, (match) => (match === "https" ? "wss" : "ws"));
}
