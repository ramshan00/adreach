function parseAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return [];

  try {
    return [new URL(siteUrl).origin];
  } catch {
    return [];
  }
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return parseAllowedOrigins().includes(origin);
}

/** True for allowlisted cross-origin clients, or same-origin browser requests (e.g. Vercel FE → Vercel API). */
export function isRequestOriginAccepted(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  if (isOriginAllowed(origin)) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

/** CORS headers for an allowed cross-origin Origin; empty for same-origin / disallowed. */
export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  if (!origin || !isOriginAllowed(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
