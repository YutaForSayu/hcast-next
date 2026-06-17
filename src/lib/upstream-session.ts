/**
 * Upstream session manager for s2.api.kcast.eu.cc
 *
 * Fetches GET / once to obtain session cookie + XSRF token,
 * caches them in memory (module-level singleton), and exposes
 * helpers consumed by the /api/proxy/[...path] route handler.
 *
 * NOTE: On Vercel/serverless each cold-start gets a fresh module,
 * so the first request after a cold start will always do one bootstrap fetch.
 * That is fine — it's a single lightweight GET.
 */

export const UPSTREAM = process.env.UPSTREAM_API_URL;

/** Minimal, fixed set of headers that mimic a real browser API call */
export const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept":          "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin":          "https://v2.komikcast.fit",
  "Referer":         "https://v2.komikcast.fit/",
  "sec-ch-ua":         '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "sec-ch-ua-mobile":  "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest":  "empty",
  "sec-fetch-mode":  "cors",
  "sec-fetch-site":  "cross-site",
  "Cache-Control":   "no-cache",
  "Pragma":          "no-cache",
};

// ─── Cookie names we care about ───────────────────────────────────────────────

/** Cookie names (lowercase) that MUST be included in every upstream request */
const REQUIRED_COOKIE_PATTERNS = [
  /^xsrf/i,
  /^laravel_session$/i,
  /^session$/i,
  /^phpsessid$/i,
  /^remember_web/i,
];

function isRequiredCookie(name: string): boolean {
  return REQUIRED_COOKIE_PATTERNS.some((re) => re.test(name));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpstreamSession {
  /** Cookie header string containing only the essential cookies */
  cookieHeader: string;
  /** Decoded XSRF token value to send as X-XSRF-TOKEN header */
  xsrfToken: string;
  refreshedAt: number;
}

// ─── Module cache ─────────────────────────────────────────────────────────────

let _session: UpstreamSession | null = null;
let _pending: Promise<UpstreamSession> | null = null;

/** Proactively refresh after 50 minutes (tokens usually last 60–120 min) */
const TTL_MS = 50 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSetCookies(headers: Headers): Map<string, string> {
  const raw: string[] = [];

  // Node 18.14+ / undici
  if (typeof (headers as any).getSetCookie === "function") {
    raw.push(...((headers as any).getSetCookie() as string[]));
  } else {
    headers.forEach((v, k) => {
      if (k.toLowerCase() === "set-cookie") raw.push(v);
    });
  }

  const map = new Map<string, string>();
  for (const line of raw) {
    const semi = line.indexOf(";");
    const pair = semi === -1 ? line : line.slice(0, semi);
    const eq   = pair.indexOf("=");
    if (eq === -1) continue;
    const name  = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (name) map.set(name, value);
  }
  return map;
}

// ─── Core ─────────────────────────────────────────────────────────────────────

async function refresh(): Promise<UpstreamSession> {
  console.log("[upstream-session] Bootstrapping session from", UPSTREAM);

  const res = await fetch(`${UPSTREAM}/`, {
    method:   "GET",
    headers:  BROWSER_HEADERS,
    cache:    "no-store",
    redirect: "follow",
  });

  const allCookies = parseSetCookies(res.headers);

  console.log("[upstream-session] Received cookies:", [...allCookies.keys()].join(", ") || "(none)");

  // Keep only the cookies the API actually needs
  const kept = new Map<string, string>();
  for (const [name, value] of allCookies) {
    if (isRequiredCookie(name)) kept.set(name, value);
  }

  // Fallback: if nothing matched the patterns, keep ALL cookies
  // (better to send too many than too few — the header size issue
  //  comes from forwarding client headers, not upstream cookies)
  const cookieMap = kept.size > 0 ? kept : allCookies;

  const cookieHeader = [...cookieMap.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  // Find the XSRF token (URL-decoded — Laravel base64+encrypts it)
  let xsrfToken = "";
  for (const [name, value] of cookieMap) {
    if (/xsrf/i.test(name)) {
      try { xsrfToken = decodeURIComponent(value); }
      catch { xsrfToken = value; }
      break;
    }
  }

  if (!cookieHeader) {
    console.warn("[upstream-session] No cookies received — API may be open or endpoint changed");
  }

  const session: UpstreamSession = { cookieHeader, xsrfToken, refreshedAt: Date.now() };
  _session = session;
  return session;
}

export async function getUpstreamSession(): Promise<UpstreamSession> {
  if (_session && Date.now() - _session.refreshedAt < TTL_MS) {
    return _session;
  }
  if (!_pending) {
    _pending = refresh().finally(() => { _pending = null; });
  }
  return _pending;
}

export function invalidateSession(): void {
  _session = null;
}
